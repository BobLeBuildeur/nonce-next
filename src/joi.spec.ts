import { expect } from "chai";
import Joi from "joi";
import { generate } from './nonce';
import customValidator from './joi';

describe("Joi custom validator", () => {

    it ('gives out error message when invalid', () => {
        const validator = Joi.custom(customValidator);

        const valid = generate();

        expect(validator.validate(valid).value).to.be.true;
        
        const { error } = validator.validate("definitelywrong");

        expect(error).not.to.be.undefined;
    });
});