/**
 * Created by maciejjaskula on 03.12.2017.
 */
'use strict';
const R = require('ramda');
const flyd = require('flyd');
const stream = flyd.stream;
const forwardTo = require('flyd-forwardto');
const Type = require('union-type');
const Router = require('./helpers/router');
const patch = require('snabbdom').init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/eventlisteners').default,
]);

const h = require('snabbdom/h').default;

const targetValue = require('./helpers/targetvalue');
const ifEnter = require('./helpers/ifenter');

const Points = require('./points')
const Question = require('./question');
//Type.check = false;

//Model
const init = () => ({
    questions: [],
    view: 'main',
    points: 0,
    ask: '',    // the ask
    askee: ''  // person asked
})

// Actions
const Action = Type({
    ChangePage: [R.T],
    Modify: [Object, Question.Action],
    UpdatePoints: [Number],
    CreateAsk: [Object],
    Remove: [Object],
    ChangeAsk: [String],
    ChangeAskee: [String]
  });

// Router
const MyRouter = Router.init({
    history: false,
    constr: Action.ChangePage,
    routes: {
      '/': 'ViewMain'
    },
  });

// Update
//action -> model -> newModel
const update = Action.caseOn({
    ChangePage: MyRouter.Action.caseOn({
        ViewMain: (_, model) => R.assoc('view', 'main', model)
    }),
    Modify: (question, action, model) => {
        const idx = R.indexOf(question, model.questions);
        const fnOverProp = R.curry((fn, prop, list) => fn(R.pluck(prop, list)));
        const modified = Question.update(action, model);

        return R.evolve({
            points: R.add(modified.score),
            questions: R.adjust(Question.update(action), idx)
        }, model)
      },
    UpdatePoints: (points) => {
        return R.assoc('points')
    },
    CreateAsk: (model) => {
        return R.evolve({
            questions: R.append(Question.init(model.ask, model.askee)),
            ask: R.always(''),
            askee: R.always('')
        }, model)
    },
    Remove: (question, model) => {
        if(ENV_IS_DEVELOPMENT) {
            console.log(R.subtract(model.points, question.score));
            console.log(model.points, question.score);
        }
        return R.evolve({ 
            points: R.always(R.subtract(model.points, question.score)),
            questions: R.reject(R.equals(question))
        }, model);
    },
    ChangeAsk: R.assoc('ask'),
    ChangeAskee: R.assoc('askee')
})

// View
const viewPoints = (action$, points) => {
    return Points.view({
        action$: forwardTo(action$, Action.UpdatePoints(points))
    }, points)
}

const viewQuestion = R.curry((action$, question) => {
    return Question.view({
        action$: forwardTo(action$, Action.Modify(question)),
        remove$: forwardTo(action$, R.always(Action.Remove(question))),
    }, question)
  })

//Main App view
const view = R.curry((action$, model) => {
    Points.init(model.points);
    return h('div', {},[
      h('div.row', {}, [
        h('section#score', viewPoints(action$, model.points))
      ]),
      h('div.row', {}, [
          h('section#forms', {}, [
              h('form', {}, [
                h('div.form-group', {}, [
                    h('label', 'Question Asked'),
                    h('input.form-control', {
                        props:{
                            placeholder: 'Who invited wheel?',
                            value: model.ask
                        },
                        on: {
                            input: R.compose(action$, Action.ChangeAsk, targetValue)
                        }
                    })
                ]),
                h('div.form-group', {}, [
                    h('label', 'Person Asked'),
                    h('input.form-control', {
                        props:{
                            placeholder: 'Maciej Jaskuła',
                            value: model.askee
                        },
                        on: {
                            input: R.compose(action$, Action.ChangeAskee, targetValue)
                        }
                    })
                ]),
                h('div.row', {}, [
                    h('div.text-center', {},[
                        h('button.btn.btn-default', {
                            props: {
                                type: 'button'
                            },
                            on: {
                                click: [action$, Action.CreateAsk(model)]
                            }
                        }, 'Submit')
                    ])
                ])
              ])
          ])
      ]),
      h('div.row', {},[
          h('section#answer-list',[
              h('ul.list-group', R.map(viewQuestion(action$), model.questions))
          ])
      ])
    ])
})
  
  // Persistence
  const restoreState = () => {
    const restored = JSON.parse(localStorage.getItem('ask'));
    return restored === null ? init() : restored;
  };
  
  const saveState = (model) => {
    localStorage.setItem('ask', JSON.stringify(model));
  };

// Streams
const action$ = flyd.merge(MyRouter.stream, flyd.stream());
const model$ = flyd.scan(R.flip(update), restoreState(), action$)
const vnode$ = flyd.map(view(action$), model$)
flyd.map(saveState, model$);

window.addEventListener('DOMContentLoaded', function() {
    const appContainer = document.querySelector('.appContainer');
    flyd.scan(patch, appContainer, vnode$)
});

