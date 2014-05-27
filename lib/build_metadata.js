#!/usr/bin/env node

var xml2js = require('xml2js'),
    fs = require('fs');

var parser = new xml2js.Parser(), countryCodes = [],
    countryAreaCodes = {}, countryMetaData = {}, isoCountry = /^[A-Z]{2}$/,
    dataset = "";

var trimRegExp = function(value) {
    if(value) {
        value = value.replace(/(?:\r\n|\r|\n|)/g, '');
        value = value.replace(/\s/g, '');
        return value;
    } else {
        return value;
    }
}

var writeString = function(value) {
    if(value) {
        value = value.replace(/\\/g, "\\\\");
        value = value.replace(/(?:\r\n|\r|\n|\t)/g, "");
        return "'"+value+"'";
    } else {
        return "null";
    }
}

fs.readFile(__dirname + '/PhoneNumberMetadata.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        var i, e, territories = result.phoneNumberMetadata.territories[0].territory,
            territory, data, countryCode, meta, formats, format;
        //console.dir(territories);
        for(i=0;i<territories.length;i++) {
            territory = territories[i];
            countryCode = territory.$.id;
            meta = {
                countryAreaCode: territory.$.countryCode || null,
                nationalPrefix: territory.$.nationalPrefix || null,
                leadingDigits: territory.$.leadingDigits || null,
                mainCountryForCode: territory.$.mainCountryForCode || false,
                formats: []
            };

            if(!isoCountry.exec(countryCode)) {
                // If countrycode is not a valid iso code then ignore it.
                continue;
            }

            if(territory.availableFormats) {
                formats = territory.availableFormats[0].numberFormat;
                for(e=0;e<formats.length;e++) {
                    format = formats[e];
                    meta.formats.push({
                        pattern: format.$.pattern,
                        leadingDigits: format.leadingDigits ? trimRegExp(format.leadingDigits[0]) : null,
                        format: format.format ? format.format[0] : null,
                        internationalFormat: format.intlFormat ? format.intlFormat[0] : null
                    });

                }
            }

            countryCodes.push(countryCode);
            countryMetaData[countryCode] = meta;
        }
    });

    // Build seperate files
    /*for(i=0;i<countryCodes.length;i++) {
        countryCode = countryCodes[i];
        meta = countryMetaData[countryCode];
        data = "if (!scope.countryCodes['"+meta.countryAreaCode+"']) {scope.countryCodes['"+meta.countryAreaCode+"'] = [];}\n";
        if(meta.mainCountryForCode) {
            data += "scope.countryCodes['"+meta.countryAreaCode+"'].unshift('"+countryCode+"');\n";
        } else {
            data += "scope.countryCodes['"+meta.countryAreaCode+"'].push('"+countryCode+"');\n";
        }


        data += "scope.countryMetaData['"+countryCode+"'] = ["+writeString(countryCode)+", "+writeString(meta.nationalPrefix)+", [\n";
        for(e=0;e<meta.formats.length;e++) {
            format = meta.formats[e];
            if (e > 0) {
                data += ',';
            }
            data += "["+writeString(format.pattern)+","+writeString(format.leadingDigits)+","+writeString(format.format)+","+writeString(format.internationalFormat)+"]\n";
        }
        data += "]];\n"
        fs.writeFileSync("tel_meta_" + countryCodes[i] + ".js", data);
    }*/

    // Build full data set
    data = 'teljs.meta = {\n';
    for(i=0;i<countryCodes.length;i++) {
        countryCode = countryCodes[i];
        meta = countryMetaData[countryCode];
        if (!countryAreaCodes[meta.countryAreaCode]) {
            countryAreaCodes[meta.countryAreaCode] = [];
        }

        if(meta.mainCountryForCode) {
            countryAreaCodes[meta.countryAreaCode].unshift(countryCode);
        } else {
            countryAreaCodes[meta.countryAreaCode].unshift(countryCode);
        }

//'US': ['1', null, [['(\\d{3})(\\d{4})', null, '$1-$2', null], ['(\\d{3})(\\d{3})(\\d{4})', null, '($1) $2-$3', '$1-$2-$3']]],
        data += writeString(countryCode)+": ["+writeString(meta.countryAreaCode)+", "+writeString(meta.nationalPrefix)+", [\n";
        for(e=0;e<meta.formats.length;e++) {
            format = meta.formats[e];
            if (e > 0) {
                data += ',';
            }
            data += "["+writeString(format.pattern)+","+writeString(format.leadingDigits)+","+writeString(format.format)+","+writeString(format.internationalFormat)+"]\n";
        }
        data += "]],\n"
    }
    data += "}; \n"
    data += "teljs.countryAreaCodes = " + JSON.stringify(countryAreaCodes, null, ' ') + ";";
    fs.writeFileSync("../src/tel_meta.js", data);
});
