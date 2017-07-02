"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
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
// `require`, don't `import` moxios because the type definition is currently broken.
const moxios = require("moxios");
const api_1 = require("../api");
const errors_1 = require("../errors");
const client = new api_1.Client(process.env.PERSPECTIVE_API_KEY);
describe("API Tests", () => {
    describe("getScores", () => {
        beforeEach(() => {
            moxios.install(axios_1.default);
        });
        afterEach(() => {
            moxios.uninstall(axios_1.default);
        });
        it("should remove html from comments by default", (done) => {
            expect.assertions(1);
            moxios.wait(() => __awaiter(this, void 0, void 0, function* () {
                const request = moxios.requests.mostRecent();
                const data = JSON.parse(request.config.data);
                expect(data.comment.text).toBe("Hello World");
                yield request.respondWith({
                    response: {
                        attributeScores: {},
                    },
                });
                done();
            }));
            client.getScores("<p>Hello World</p>");
        });
        it("should not remove html when stripHtml is false", (done) => {
            expect.assertions(1);
            moxios.wait(() => __awaiter(this, void 0, void 0, function* () {
                const request = moxios.requests.mostRecent();
                const data = JSON.parse(request.config.data);
                expect(data.comment.text).toBe("<p>Hello World</p>");
                yield request.respondWith({
                    response: {
                        attributeScores: {},
                    },
                });
                done();
            }));
            client.getScores("<p>Hello World</p>", { stripHtml: false });
        });
        it("should error when comment length over 3k characters", () => __awaiter(this, void 0, void 0, function* () {
            expect.assertions(1);
            try {
                yield client.getScores("C".repeat(3001));
            }
            catch (error) {
                expect(error instanceof errors_1.PerspectiveClientTextTooLongError).toBe(true);
            }
        }));
        it("should error when comment is an empty string", () => __awaiter(this, void 0, void 0, function* () {
            expect.assertions(1);
            try {
                yield client.getScores("");
            }
            catch (error) {
                expect(error instanceof errors_1.PerspectiveClientTextEmptyError).toBe(true);
            }
        }));
        it("should error when passed an empty string as an attribute", () => __awaiter(this, void 0, void 0, function* () {
            expect.assertions(1);
            try {
                yield client.getScores("text", { attributes: [""] });
            }
            catch (error) {
                expect(error instanceof errors_1.PerspectiveClientAttributeInvalidError).toBe(true);
            }
        }));
        it("should error when passed an empty array of attributes", () => __awaiter(this, void 0, void 0, function* () {
            expect.assertions(1);
            try {
                yield client.getScores("text", { attributes: [] });
            }
            catch (error) {
                expect(error instanceof errors_1.PerspectiveClientAttributeInvalidError).toBe(true);
            }
        }));
        it("should return an object with attribute scores for each attribute passed in", () => __awaiter(this, void 0, void 0, function* () {
            expect.assertions(1);
            moxios.wait(() => {
                const request = moxios.requests.mostRecent();
                request.respondWith({
                    response: {
                        attributeScores: {
                            SPAM: {
                                summaryScore: {
                                    value: "0.1",
                                },
                            },
                            TOXICITY: {
                                summaryScore: {
                                    value: "0.9",
                                },
                            },
                        },
                    },
                    status: 200,
                });
            });
            const data = yield client.getScores("text");
            expect(data).toMatchObject({
                SPAM: 0.1,
                TOXICITY: 0.9,
            });
        }));
    });
});
