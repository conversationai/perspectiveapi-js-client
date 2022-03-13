"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const axios_1 = require("axios");
const striptags_1 = require("striptags");
const errors_1 = require("./errors");
function buildRequestedAttributes(attributes) {
    const attributeObject = {};
    attributes.forEach((attribute) => {
        attributeObject[attribute] = {};
    });
    return attributeObject;
}
function fetchCommentAnalysis(requestObject, PERSPECTIVE_API_URL) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default({
                data: requestObject,
                method: "post",
                responseType: "json",
                url: PERSPECTIVE_API_URL,
            });
            return response.data;
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
function validateAttributes(atts) {
    if (!atts.length) {
        throw new errors_1.PerspectiveClientAttributeInvalidError("must submit at least one attribute to be scored");
    }
    atts.forEach((attribute) => {
        if (attribute === "" || attribute === null || attribute === "undefined") {
            throw new errors_1.PerspectiveClientAttributeInvalidError("invalid attribute in options: " + attribute);
        }
    });
    return true;
}
function validateText(text) {
    if (text === "") {
        throw new errors_1.PerspectiveClientTextEmptyError("comment text cannot be empty");
    }
    if (text.length > 3000) {
        throw new errors_1.PerspectiveClientTextTooLongError("comment text must be fewer than 3000 characters");
    }
    return true;
}
class Client {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.perspectiveApiUrl =
            `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${this.apiKey}`;
    }
    getScores(text, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { attributes = ["SPAM", "TOXICITY"], context, doNotStore = true, languages = ["en"], stripHtml = true, } = options;
            validateText(text);
            validateAttributes(attributes);
            const requestObject = {
                comment: {
                    text: stripHtml ? striptags_1.default(text) : text,
                },
                context,
                doNotStore,
                languages,
                requestedAttributes: buildRequestedAttributes(attributes),
            };
            try {
                const response = yield fetchCommentAnalysis(requestObject, this.perspectiveApiUrl);
                const { attributeScores } = response;
                const scoreValues = {};
                for (const attribute in attributeScores) {
                    if (attributeScores.hasOwnProperty(attribute)) {
                        scoreValues[attribute] = (parseFloat(attributeScores[attribute].summaryScore.value));
                    }
                }
                return scoreValues;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
}
exports.Client = Client;
//# sourceMappingURL=api.js.map