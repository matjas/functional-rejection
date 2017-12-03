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
    ChangePoints: [String]
})

//Update
const update = Action.caseOn({ //action -> model -> model
    ChangePoints: R.assoc('title')
})

//View
const view = R.curry((context, model) =>
    h('div', {
        class: 'col-sm-12 text-center'
    }, [
        h('p', 'Score'),
        h('p#totalScore',{}, model.points)
    ])
)

module.exports = {init, Action, update, view}