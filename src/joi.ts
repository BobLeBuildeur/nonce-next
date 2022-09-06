import { compare } from './nonce';
import { CustomHelpers } from 'joi';


export default (value: string, helper: CustomHelpers) => {
    if (!compare(value)) return helper.error("any.invalid");
    return true
}
