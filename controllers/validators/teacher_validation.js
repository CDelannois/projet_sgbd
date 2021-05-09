const validator = require('validator');

module.exports = {

    teacher_validation: function (first_name, last_name, discipline) {
        let validate_first_name;
        let validate_last_name;
        let validate_discipline;

        if (validator.isLength(first_name, {
            min: 3,
            max: 25
        }) && validator.isAlpha(first_name, "fr-FR", {
            ignore: " -"
        })) {
            validate_first_name = true;
        } else {
            validate_first_name = false;
            console.log("First name can only contain letters and can only be 25 characters long.");
        }

        if (validator.isLength(last_name, {
            min: 3,
            max: 25
        }) && validator.isAlpha(last_name, "fr-FR", {
            ignore: " -"
        })) {
            validate_last_name = true;
        } else {
            validate_last_name = false;
            console.log("Last name can only contain letters and can only be 25 characters long.");
        }

        if (validator.isLength(discipline, {
            min: 3,
            max: 25
        }) && validator.isAlpha(discipline, "fr-FR", {
            ignore: " -"
        })) {
            validate_discipline = true;
        } else {
            validate_discipline = false;
            console.log("Discpline can only contain letters and can only be 25 characters long.");
        }

        if (validate_first_name == true && validate_last_name == true && validate_discipline == true) {
            return true;
        } else {
            return false;
        }
    },



    course_validation: function (label, grade, group) {

        let validate_label;
        let validate_grade;
        let validate_group;

        if (validator.isLength(label, {
            min: 2,
            max: 25
        })) {
            validate_label = true;
        } else {
            validate_label = false;
            console.log("Label is required. Max. 25 characters.")
        }

        if (validator.isLength(grade, {
            max: 25
        })) {
            validate_grade = true;
        } else {
            validate_grade = false;
            console.log("Grade is required. Max. 25 characters.")
        }
        if (validator.isLength(group, {
            max: 10
        })) {
            validate_group = true;
        } else {
            validate_group = false;
            console.log("Group is required. Max. 10 characters.")
        }

        if (validate_grade == true && validate_group == true && validate_label == true) {
            return true;
        } else {
            return false;
        }
    }
}