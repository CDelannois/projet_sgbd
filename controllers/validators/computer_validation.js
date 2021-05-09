const validator = require('validator');

module.exports = {

    computer_validation: function (computer_name, operating_system, disk_type, disk_capacity, installation) {
        let validate_computer_name;
        let validate_operating_system;
        let validate_disk_type;
        let validate_disk_capacity;
        let validate_installation;

        if (validator.isLength(computer_name, {
            min: 3,
            max: 25
        })) {
            validate_computer_name = true;
        } else {
            validate_computer_name = false;
            console.log("Computer name is required and can only be 25 characters long.");
        }

        if (validator.isLength(operating_system, {
            min: 3,
            max: 50
        })) {
            validate_operating_system = true;
        } else {
            validate_operating_system = false;
            console.log("Operating system is required and can only be 50 characters long.");
        }

        if (validator.isLength(disk_type, {
            min: 3,
            max: 25
        }) && validator.isAlpha(disk_type, "fr-FR", {
            ignore: " -"
        })) {
            validate_disk_type = true;
        } else {
            validate_disk_type = false;
            console.log("Disk type is required, can only contain letters and can only be 25 characters long.");
        }

        if (validator.isLength(disk_capacity, {
            min: 3,
            max: 25
        })) {
            validate_disk_capacity = true;
        } else {
            validate_disk_capacity = false;
            console.log("Disk capacity is required and can only be 25 characters long.");
        }

        if (validator.isLength(disk_type, {
            min: 3,
            max: 25
        }) && validator.isAlpha(disk_type, "fr-FR", {
            ignore: " -"
        })) {
            validate_disk_type = true;
        } else {
            validate_disk_type = false;
            console.log("Disk type is required, can only contain letters and can only be 25 characters long.");
        }

        if (validator.isDate(installation)) {
            validate_installation = true;
        } else {
            validate_installation = false;
            console.log("Installation date is required, and must respect YYYY/MM/DD format.");
        }

        if (validate_computer_name == true && validate_operating_system == true && validate_disk_type == true && validate_disk_capacity == true && validate_installation == true) {
            return true;
        } else {
            return false;
        }
    },

    software_validation: function (name, description) {

        let validate_name;
        let validate_description;

        if (validator.isLength(name, {
            min: 2,
            max: 50
        })) {
            validate_name = true;
        } else {
            validate_name = false;
            console.log("Name is required. Max. 50 characters.")
        }

        if (validator.isLength(description, {
            min: 20,
            max: 500
        })) {
            validate_description = true;
        } else {
            validate_description = false;
            console.log("Description is required. Min. 20 and max. 500 characters.")
        }

        if (validate_name == true && validate_description == true) {
            return true;
        } else {
            return false;
        }
    },

    intervention_validation: function (date, object) {
        let validate_date;
        let validate_object;

        if (validator.isDate(date)) {
            validate_date = true;
        } else {
            validate_date = false;
            console.log("Date is required, must respect YYYY/MM/DD format.");
        }

        if (validator.isLength(object, {
            min: 10,
            max: 500
        })) {
            validate_object = true;
        } else {
            validate_object = false;
            console.log("Object description is required, max. 500 characters.");
        }

        if (validate_object == true && validate_date == true){
            return true;
        }else{
            return false;
        }
    }
}