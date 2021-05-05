const {
    default: validator
} = require('validator');

exports function course_validation(label, grade, group) {

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