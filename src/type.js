export const Type = {
    INTEGER: 'INTEGER',
    FLOAT: 'FLOAT',
    BOOLEAN: 'BOOLEAN',
}

class TypeCheckerClass {

    isInteger(type) {
        return this._isType(type, Type.INTEGER);
    }

    isFloat(type) {
        return this._isType(type, Type.FLOAT);
    }

    isBoolean(type) {
        return this._isType(type, Type.BOOLEAN);
    }

    isNumber(type) {
        return this.isInteger(type) || this.isFloat(type)
    }

    isBothNumber(type1, type2) {
        return this.isNumber(type1) && this.isNumber(type2);
    }

    isBothInteger(type1, type2) {
        return this.isInteger(type1) && this.isInteger(type2);
    }

    isAtLeastOneReal(type1, type2) {
        return this.isBothNumber(type1, type2) &&
                (this.isFloat(type1 || this.isFloat(type2)));
    }

    areAssignmentCompatible(targetType, valueType) {
        return targetType === valueType ||
                (this.isFloat(targetType) && this.isInteger(valueType));
    }

    areComparisonCompatible(type1, type2) {
        return type1 === type2 ||
                this.isBothNumber(type1, type2);
    }

    _isType(type, requiredType) {
        return type === requiredType
    }
}
export const TypeChecker = new TypeCheckerClass()