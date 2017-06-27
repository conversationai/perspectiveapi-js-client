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
import axios from "axios";
// `require`, don't `import` moxios because the type definition is currently broken.
const moxios = require("moxios");
import {Client} from "../api";
import {
  PerspectiveNodeAttributeInvalidError,
  PerspectiveNodeTextEmptyError,
  PerspectiveNodeTextTooLongError,
} from "../errors";

const client = new Client(process.env.PERSPECTIVE_API_KEY);

describe("API Tests", () => {
  describe("getScores", () => {
    beforeEach(() => {
      moxios.install(axios);
    });

    afterEach(() => {
      moxios.uninstall(axios);
    });

    it("should remove html from comments by default", (done) => {
      expect.assertions(1);

      moxios.wait( async () => {
        const request = moxios.requests.mostRecent();
        const data = JSON.parse(request.config.data);
        expect(data.comment.text).toBe("Hello World");
        await request.respondWith({
          response: {
            attributeScores: {},
          },
        });
        done();
      });

      client.getScores("<p>Hello World</p>");
    });

    it("should not remove html when stripHtml is false", (done) => {
      expect.assertions(1);

      moxios.wait( async () => {
        const request = moxios.requests.mostRecent();
        const data = JSON.parse(request.config.data);
        expect(data.comment.text).toBe("<p>Hello World</p>");
        await request.respondWith({
          response: {
            attributeScores: {},
          },
        });
        done();
      });

      client.getScores("<p>Hello World</p>", {stripHtml: false});
    });

    it("should error when comment length over 3k characters", async () => {
      expect.assertions(1);

      try {
        await client.getScores("C".repeat(3001));
      } catch (error) {
        expect(error instanceof PerspectiveNodeTextTooLongError).toBe(true);
      }
    });

    it("should error when comment is an empty string", async () => {
      expect.assertions(1);

      try {
        await client.getScores("");
      } catch (error) {
        expect(error instanceof PerspectiveNodeTextEmptyError).toBe(true);
      }
    });

    it("should error when passed an empty string as an attribute", async () => {
      expect.assertions(1);

      try {
        await client.getScores("text", {attributes: [""]});
      } catch (error) {
        expect(error instanceof PerspectiveNodeAttributeInvalidError).toBe(true);
      }
    });

    it("should error when passed an empty array of attributes", async () => {
      expect.assertions(1);

      try {
        await client.getScores("text", {attributes: []});
      } catch (error) {
        expect(error instanceof PerspectiveNodeAttributeInvalidError).toBe(true);
      }
    });

    it("should return an object with attribute scores for each attribute passed in", async () => {
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
      const data = await client.getScores("text", {attributes: DEFAULT_ATTRIBUTES});
      expect(data).toMatchObject({
        SPAM: 0.1,
        TOXICITY: 0.9,
      });
    });
  });
});
