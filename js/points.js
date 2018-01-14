const R = require('ramda');
const Type = require('union-type');
const h = require('snabbdom/h').default;

const targetValue = require('./helpers/targetvalue');
const ifEnter = require('./helpers/ifenter');

//Model
const init = (points) => ({
    points
})

//Actions
const Action = Type({
    ChangePoints: [Number]
})

//Update
const update = Action.caseOn({ //action -> model -> model
    ChangePoints: R.assoc('points')
})

//View
const view = R.curry((context, model) =>{
    return h('div.col-sm-12.text-center', [
        h('p', 'Score'),
        h('p#totalScore', model)
    ])
})

module.exports = {init, Action, update, view}