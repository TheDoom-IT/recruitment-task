import { parseDescription, parseFullName, parseName, parsePrice, parseTimestamp, validateNumber, validateString } from "./validation"


describe('validateString', () => {
    
    describe('validation passes', () => {
        it('should return true', () => {
            expect(validateString('test',5)).toBe(true);
        })
    })

    describe('validation fails', () => {
        it('should return false', () => {
            expect(validateString('tooLongString',5)).toBe(false);
        });

        it('should return false', () => {
            expect(validateString('',5)).toBe(false);
        });
    });
})



describe('validateNumber', () => {
    describe('validation passes', () => {
        it('should return true', () => {
            expect(validateNumber(5,10)).toBe(true);
        })
    })

    describe('validation fails', () => {
        it('should return false', () => {
            expect(validateNumber(5,3)).toBe(false);
        });

        it('should return false', () => {
            expect(validateNumber(-1,3)).toBe(false);
        });
    });
})


describe('parseTimestamp', () => {
    describe('validation passes', () => {
        it('should return nothing(void function)', () => {
            expect(parseTimestamp(1000)).toBe(undefined);
        })
    })

    describe('validation fails', () => {
        it('should throw an exception', () => {
            expect(() => parseTimestamp(-10)).toThrow('The field "timestamp" has unproper value. It can\'t be negative or in the future.');
        })

        it('should throw an exception', () => {
            expect(() => parseTimestamp(Date.now()/1000+1)).toThrow('The field "timestamp" has unproper value. It can\'t be negative or in the future.');
        })
    })
})

describe('parseName', () => {
    describe('validation passes', () => {
        it('should return nothing(void function)', () => {
            expect(parseName('short name')).toBe(undefined);
        })
    })

    describe('validation fails', () => {
        it('should throw an exception', () => {
            expect(() => parseName('tooLongNameWhichCanNotBeUsed')).toThrow('The field "name" has unproper value. The length should be between 1 and 20.');
        })

        it('should throw an exception', () => {
            expect(() => parseName('')).toThrow('The field "name" has unproper value. The length should be between 1 and 20.');
        })
    })
})

describe('parsePrice', () => {
    describe('validation passes', () => {
        it('should return nothing(void function)', () => {
            expect(parsePrice(1234)).toBe(undefined);
        })
    })

    describe('validation fails', () => {
        it('should throw an exception', () => {
            expect(() => parsePrice(-5)).toThrow('The field "price" has unproper value. It can\'t be negative and greater or equal to 10^8.');
        })

        it('should throw an exception', () => {
            expect(() => parsePrice(10**15)).toThrow('The field "price" has unproper value. It can\'t be negative and greater or equal to 10^8.');
        })
    })
})

describe('parseFullName', () => {
    describe('validation passes', () => {
        it('should return nothing(void function)', () => {
            expect(parseFullName('someFullName')).toBe(undefined);
        })
    })

    describe('validation fails', () => {
        it('should throw an exception', () => {
            expect(() => parseFullName('')).toThrow();
        })

        it('should throw an exception', () => {
            let tooLongString: string = '';
            for(let x = 0; x < 100; x++){
                tooLongString+=' ';
            }
            expect(() => parseFullName(tooLongString)).toThrow('The field "fullName" has unproper value. The length should be between 1 and 50.');
        })
    })
})

describe('parseDescription', () => {
    describe('validation passes', () => {
        it('should return nothing(void function)', () => {
            expect(parseDescription('The company producing furnitures.')).toBe(undefined);
        })
    })

    describe('validation fails', () => {
        it('should throw an exception', () => {
            expect(() => parseDescription('')).toThrow();
        })

        it('should throw an exception', () => {
            let tooLongString: string = '';
            for(let x = 0; x < 250; x++){
                tooLongString+=' ';
            }
            expect(() => parseDescription(tooLongString)).toThrow('The field "description" has unproper value. The length should be between 1 and 200.');
        })
    })
})