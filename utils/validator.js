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

  static isPan(pan) {
    if (!pan) return false;
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(pan).trim().toUpperCase());
  }

  static isIndianMobile(mobile) {
    if (!mobile) return false;
    return /^[6-9]\d{9}$/.test(String(mobile).trim());
  }
}

module.exports = Validator;