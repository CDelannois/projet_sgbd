const validator = require('validator');

module.exports = {

    class_validation: function (label, option, local) {
        let validate_label;
        let validate_option;
        let validate_local;


        if (validator.isLength(label, {
            min: 3,
            max: 25
        })) {
            validate_label = true;
        } else {
            validate_label = false;
            console.log("Class label is required and can only be 25 characters long.");
        }

        if (validator.isLength(option, {
            min: 3,
            max: 50
        })) {
            validate_option = true;
        } else {
            validate_option = false;
            console.log("Class option is required and can only be 50 characters long.");
        }

        if (validator.isLength(local, {
            min: 3,
            max: 25
        })) {
            validate_local = true;
        } else {
            validate_local = false;
            console.log("Class local is required, can only contain letters and can only be 25 characters long.");
        }

        if (validate_label == true && validate_option == true && validate_local == true) {
            return true;
        } else {
            return false;
        }
    },

    student_validation: function (last_name, first_name) {

        let validate_first_name;
        let validate_last_name;

        if (validator.isLength(last_name, {
            min: 2,
            max: 50
        }) && validator.isAlpha(last_name, "fr-FR", {
            ignore: " -"
        })) {
            validate_last_name = true;
        } else {
            validate_last_name = false;
            console.log("Last name is required. It can only contain letters and can be 50 characters long.")
        }

        if (validator.isLength(first_name, {
            min: 2,
            max: 50
        }) && validator.isAlpha(first_name, "fr-FR", {
            ignore: " -"
        })) {
            validate_first_name = true;
        } else {
            validate_first_name = false;
            console.log("First name is required. It can only contain letters and can be 50 characters long.")
        }
        if (validate_last_name == true && validate_first_name == true) {
            return true;
        } else {
            return false;
        }
    },
}