const validator = require('validator');

module.exports = {

    local_validation: function (label, type) {
        let validate_label;
        let validate_type;


        if (validator.isLength(label, {
            min: 3,
            max: 10
        })) {
            validate_label = true;
        } else {
            validate_label = false;
            console.log("Label is required and can only be 10 characters long.");
        }

        if (validator.isLength(type, {
            min: 3,
            max: 50
        })) {
            validate_type = true;
        } else {
            validate_type = false;
            console.log("Class type is required and can only be 50 characters long.");
        }

        if (validate_label == true && validate_type == true) {
            return true;
        } else {
            return false;
        }
    }
}