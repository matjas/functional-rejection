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
//const log4js = require('log4js');
const h = require('snabbdom/h').default;

const targetValue = require('./helpers/targetvalue');
const ifEnter = require('./helpers/ifenter');

//const Points = require('./points')

//Model
const init = () => ({
    view: 'main'
})

// Actions
const Action = Type({
    ChangePage: [R.T],
    UpdatePoints: [String]
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
    })
    // UpdatePoints: (points, action, model) => {
    //     return R.evolve({})
    // }
})

// View
// const viewPoints = R.curry((action$, points) => {
//     return Points.view({
//         action$: forwardTo(action$, Action.UpdatePoints(points))
//     }, points)
// })

const vNode = h('div.row', {},[
        h('section#score')
    ]);

// const view = R.curry((action$, model) => {
//     h('div.row', {}, [
//         h('section#score')
//     ]),
//     h('div.row', {}, [
//         h('section#forms')
//     ]),
//     h('div.row', {},[
//         h('section#answer-list',[
//             h('ul.list-group')
//         ])
//     ])
// })
  
  // Persistence
  const restoreState = () => {
    //const restored = JSON.parse(localStorage.getItem('state'));
    //return restored === null ? init() : restored;
    return init();
  };
  
  const saveState = (model) => {
    localStorage.setItem('state', JSON.stringify(model));
  };

// Streams
const action$ = flyd.merge(MyRouter.stream, flyd.stream());
console.log(action$);
const model$ = flyd.scan(R.flip(update), restoreState(), action$)
console.log(model$)
//const vnode$ = flyd.map(view(action$), model$)
//console.log(vnode$);
//const = 

window.addEventListener('DOMContentLoaded', function() {
    const appContainer = document.querySelector('.appContainer');
    console.log(appContainer);
    //flyd.scan(patch, appContainer, vNode)
    patch(appContainer, vNode)
});

