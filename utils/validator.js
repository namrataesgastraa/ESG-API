const { parsePhoneNumberFromString } = require('libphonenumber-js');

class Validator {

  static required(fields, body) {
    for (let field of fields) {
      if (!body[field] || body[field].toString().trim() === '') {
        return `${field} is required`;
      }
    }
    return null;
  }

  static isEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static isStrongPassword(password) {
    return password && password.length >= 6;
  }

  static isMobile(mobile) {
    try {
      const phone = parsePhoneNumberFromString(mobile);
      return phone && phone.isValid();
    } catch (error) {
      return false;
    }
  }
}

module.exports = Validator;