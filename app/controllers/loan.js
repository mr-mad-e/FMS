﻿var models = require('../models');
var Loan = models.Loan;
var Installment = models.Installment;
var Customer = models.Customer;
var OrderStatus = models.OrderStatus;
var User = models.User;
var Sequelize = require('sequelize');
var _ = require('underscore');
//get Error Message Consized
var getErrorMessage = function (err) {
    if (err.errors) {
        for (var errorName in err.errors) {
            if (err.errors[errorName].message) {
                return err.errors[errorName].message;
            }
        }
    } else {
        return 'Unknown Server Error';
    }
}

//getting List of 
//For Geting list of Loans
exports.list = function (req, res) {
    req.options.include = [Customer, OrderStatus];
    Loan.findAndCountAll(req.options).then(function (arrs) {
        res.setHeader('total', arrs.count);
        res.json(arrs.rows);
    }).catch(function (err) {
        console.log(err);
        res.status(400).send({ message: getErrorMessage(err) });
    });
}

exports.read = function (req, res) {
    res.json(req.loan);
}

exports.getById = function (req, res, next) {
    Loan.findOne({
        where: { id: req.params.loanId },
        include: [Customer]
    }).then(function (obj) {
        req.loan = obj;
        next();
    }).catch(function (err) {
        res.status(400).send({ message: getErrorMessage(err) });
    });
}

exports.create = function (req, res) {
    var start = new Date();

    Loan.create(req.body).then(function (obj) {
        if (!obj) {
            return res.send({ message: "Error Occured while updataing" });
        }
        var objData = obj.get({
            plain: true
        });
        for (var index = 1; index <= req.body.loanTenure; index++) {

            var objTemp = { installmentNumber: index, installmentAmount: req.body.installmentAmount, dueDate: start, LoanId: obj.dataValues.id };

            Installment.create(objTemp).then(function (obj) {
                var newDate = start.setDate(start.getDate() + 1);
                start = new Date(newDate);
            }).catch(function (error) {
                console.log('error');
            });

        }
        res.json(objData);
    }).catch(function (error) {
        res.status(400).status(500).send({ message: getErrorMessage(error) });
    });
}

exports.update = function (req, res) {
    // var loan = req.loan;
    // _.forEach(req.body, function (val, key) {
    //     loan.dataValues[key] = val;
    // });
    Loan.update(req.loan, {
        where: {
            id: req.params.loanId
        }
    })
        .then(function (obj) {
            return res.json(obj);
        }).catch(function (error) {
            return res.status(400).send({ message: getErrorMessage(error) });
        });

}