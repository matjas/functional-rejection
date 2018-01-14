const R = require('ramda');
const Type = require('union-type');
const h = require('snabbdom/h').default;

const targetValue = require('./helpers/targetvalue');
const ifEnter = require('./helpers/ifenter');

//Model
const init = (ask, askee) => ({
    timestamp: Date.now(),
    ask: ask,    // the ask
    askee: askee,  // person asked
    status: '',  //'Accepted ' or 'Rejected',
    score: 0,
    answerDate: ''
})

//Actions
const Action = Type({
    Accept:[Object],
    Reject: [Object]
})
//Update
const update = Action.caseOn({ //action -> model -> model
    Accept: function(model){
        return R.evolve({
            score: R.add(1),
            answerDate: Date.now(),
            status: 'accept'
        }, model);
    },
    Reject: function(model){
        return R.evolve({
            score: R.add(10),
            answerDate: Date.now(),
            status: 'reject'
        }, model);
    }
})

//View
const view = R.curry((context, model) => {
    return h('li.list-group-item.list-group-item-info', {},[
            h('button.badge.delete-btn',{
                on:{click: [context.remove$, undefined]}
            }, 'delete'),
            h('p#question', {},[
                h('strong', 'Question: '),
                model.ask
            ]),
            h('p#person', {
            }, [
                h('strong', 'Person: '),
                model.askee
            ]),
            h('p#points', {
            }, [
                h('strong', 'Ask score:'),
                model.score
            ]),
            h('p#submission-date', {
            }, [
                h('i', 'Submitted on:'),
                model.timestamp
            ]),
            h('div.row', {}, [
                h('div.col-sm-6 text-center', {},[
                    h('button.btn.btn-default', {
                        on: {click: [context.action$, Action.Accept(model)]},
                        class: {disabled: model.score !== 0},
                        props: {disabled: model.score !== 0}
                    }, 'Accepted')
                ]),
                h('div.col-sm-6 text-center', {},[
                    h('button.btn.btn-default', {
                        on: {click: [context.action$, Action.Reject(model)]},
                        class: {disabled: model.score !== 0},
                        props: {disabled: model.score !== 0}
                    }, 'Rejected')
                ])
            ])
        ])
})

module.exports = {init, Action, update, view}