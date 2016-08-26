
declare var i18n;

export interface FormatResult {
    number: string;
    valid: boolean;
}

export enum Mode {
    E164, National
}

export class Util {
    static trimNumber(value: string) {
        if (angular.isString(value)) {
            return value.replace(/[\+\s\-\(\)]/g, '');
        } else {
            return value;
        }
    }
}

export function telephoneFilter() {

    return function (input: string, mode: string, defaultAreaCode: string, returnObject: boolean) {

        var trimmedNumber, defaultGeneratedNumber, number;
        var filter = new TelephoneFilter();
        mode = mode ? mode : 'e164';
        trimmedNumber = Util.trimNumber(input);

        number = filter.formatNumber(trimmedNumber, mode);
        if (number) {
            return filter.wrapResult(input, number, returnObject);
        }

        if (defaultAreaCode && defaultAreaCode !== '') {
            defaultGeneratedNumber = defaultAreaCode + '' + trimmedNumber;
            number = filter.formatNumber(defaultGeneratedNumber, mode);
            if (number) {
                return filter.wrapResult(input, number, returnObject);
            }
        }

        return filter.wrapResult(input, number, returnObject);
        
    };


}


class TelephoneFilter {
    countryCodes = i18n.phonenumbers.metadata.countryCodeToRegionCodeMap;
    countryMetaData = i18n.phonenumbers.metadata.countryToMetadata;
    validRangeMap = {
        2: 'fixedLine',
        3: 'mobile',
        4: 'tollFree',
        5: 'premiumRate',
        6: 'sharedCost',
        7: 'personalNumber',
        8: 'voip',
        21: 'pager',
        24: 'noInternationalDialing',
        25: 'uan',
        28: 'voiceMail'
    };

    private regionsFromNumber(e164: string): Object[] {
        let regions: Object[], key, value;
        for (key in this.countryCodes) {
            value = this.countryCodes[key];
            var reg = new RegExp('^' + key),
                ok;

            ok = reg.exec(e164);

            if (ok) {
                regions = value;
                break;
            }
        }

        return regions;
    }

    private formatNumberForRegion(region: string, nationalNumber: string, mode: Mode, mainRegion: string): string {
        var metaData = this.countryMetaData[region],
            metaDataMain = this.countryMetaData[mainRegion],
            countryCode = metaData[10],
            nationalPrefix = metaData[12],
            nationalFormats = metaDataMain[19],
            internationalFormats = metaDataMain[20],
            number, international = (mode === Mode.E164),
            numberFormats = international && internationalFormats ? internationalFormats : nationalFormats,
            entry, i, matchNumber, matchLeadingDigits, validRange = false, range;

        if (numberFormats) {

            if (nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) === nationalPrefix) {
                nationalNumber = nationalNumber.substr(nationalPrefix.length);
            }

            for (var key in this.validRangeMap) {
                entry = metaData[key];
                if (new RegExp('^(' + entry[2] + ')$').exec(nationalNumber)) {
                    validRange = true;
                    range = this.validRangeMap[key];
                    break;
                }
            }

            if (validRange) {
                for (i = 0; i < numberFormats.length; i++) {
                    entry = numberFormats[i];
                    matchNumber = new RegExp('^(' + entry[1] + ')$').exec(nationalNumber);

                    if (!angular.isDefined(entry[3])) {
                        matchLeadingDigits = true;
                    } else if (angular.isString(entry[3])) {
                        matchLeadingDigits = new RegExp('^(' + entry[3] + ')').exec(nationalNumber);
                    } else if (angular.isArray(entry[3])) {
                        angular.forEach(entry[3], function (lead) {
                            var result = new RegExp('^(' + lead + ')').exec(nationalNumber);
                            if (result) {
                                matchLeadingDigits = true;
                            }
                        });
                    }

                    if (matchNumber && matchLeadingDigits) {
                        var format = entry[2];
                        if (international) {
                            number = nationalNumber;
                            number = number.replace(new RegExp(entry[1]), format);
                            number = '+' + countryCode + ' ' + number;
                        } else {
                            number = nationalNumber;
                            number = number.replace(new RegExp(entry[1]), format);
                            
                            if (nationalPrefix) {
                                number = nationalPrefix + '' + number;
                            }
                            
                        }
                        break;
                    }
                }
            }
        }
        return number;
    }

    public formatNumber(number: string, mode: Mode | string): string {
        let regions = this.regionsFromNumber(number), region, i, countryCode, nationalPrefix, nationalNumber, result, mainRegion;
        let finalMode: Mode;

        if (typeof mode === 'string') {
            finalMode = mode === 'e164' ? Mode.E164 : Mode.National;
        } else {
            finalMode = mode;
        }

        if (angular.isNumber(number)) {
            number = number.toString();
        }

        if (regions && regions.length > 0) {
            mainRegion = regions[0];

            for (i = 0; i < regions.length; i++) {
                region = regions[i];
                if (this.countryMetaData[region]) {
                    countryCode = this.countryMetaData[region][10];
                    nationalPrefix = this.countryMetaData[region][12];
                    nationalNumber = number.substr(countryCode.toString().length);
                    if (nationalPrefix && nationalNumber.substr(0, nationalPrefix.length) !== nationalPrefix) {
                        nationalNumber = nationalPrefix + '' + nationalNumber;
                    }
                    result = this.formatNumberForRegion(region, nationalNumber, finalMode, mainRegion);
                    if (result) {
                        break;
                    }
                }
            }
        }
        return result;
    };

    public wrapResult(input: string, number: string, returnObject: boolean): string | FormatResult {
        var result: string | FormatResult;

        if (returnObject) {
            if (!number) {
                result = {
                    number: input,
                    valid: false
                };
            } else {
                result = {
                    number: number,
                    valid: true
                };
            }
        } else {
            if (!number) {
                result = input;
            } else {
                result = number;
            }
        }
        return result;
    };
}