const Expense = require('../models/Expense');

const categories = [
    'advertising',
    'benefits',
    'car',
    'equipment',
    'fees',
    'home-office',
    'insurance',
    'interest',
    'Labor',
    'maintenance',
    'materials',
    'meals-and-entertainment',
    'office-supplies',
    'other',
    'professional-services',
    'rent',
    'taxes',
    'travel',
    'utilities',
];

async function getAll() {
    let result = await Expense.find().lean();

    return result;
}

async function getOne(id, _) {
    let expense = await Expense.findById(id).lean();

    return expense;
}

function create(data, creatorId) {
    let { merchant, total, category, description, report } = data;

    if (!categories.includes(category)) {
        throw { message: 'Invalid category' };
    }

    if (Number(total) < 0) {
        throw { message: 'Total should be positive number' };
    }

    let categoryToUpperCase = category[0].toUpperCase() + category.slice(1);
    let isChecked = report ? true : false;

    let expense = new Expense({
        merchant,
        total: Number(total),
        category: categoryToUpperCase,
        description,
        report: isChecked,
        creatorId,
    });

    return expense.save();
}

function deleteOne(expenseId) {
    return Expense.deleteOne({ _id: expenseId });
}

module.exports = {
    getAll,
    getOne,
    create,
    deleteOne,
};
