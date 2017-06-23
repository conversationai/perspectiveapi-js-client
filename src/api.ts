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
const axios = require("axios");
const striptags: (a: string) => string = require("striptags");
const {
  PerspectiveNodeAttributeInvalidError,
  PerspectiveNodeTextEmptyError,
  PerspectiveNodeTextTooLongError,
} = require("./errors");

export interface IContext {
  entries: Array<{
    text?: string;
    type?: string;
  }>;
}

interface IRequestedAttributes {
  [attribute: string]: {
    scoreType?: string;
    scoreThreshold?: number;
  };
}

// Comment Analyzer API types (from Perspective API docs).
interface IAnalyzeCommentRequest {
  comment: {
    text: string;
    type?: string;
  };
  requestedAttributes: IRequestedAttributes;
  context?: IContext;
  languages?: string[];
  clientToken?: string;
  doNotStore?: boolean;
}

export interface IAnalysisResults {
  attributeScores: {
    [attribute: string]: {
      summaryScore: {
        value: string;
      };
    };
  };
}

export interface IAttributeScores {
  [attribute: string]: number;
}

function buildRequestedAttributes(attributes: string[]): IRequestedAttributes {
  const attributeObject: IRequestedAttributes = {};
  attributes.forEach((attribute) => {
    attributeObject[attribute] = {};
  });
  return attributeObject;
}

async function fetchCommentAnalysis(
    requestObject: IAnalyzeCommentRequest,
    PERSPECTIVE_API_URL: string,
  ): Promise<IAnalysisResults> {
  try {
    const response = await axios({
      data: requestObject,
      method: "post",
      responseType: "json",
      url: PERSPECTIVE_API_URL,
    });
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

function validateAttributes(atts: string[]) {
  if (!atts.length) {
    throw new PerspectiveNodeAttributeInvalidError("must submit at least one attribute to be scored");
  }
  atts.forEach((attribute: string) => {
    if (attribute === "" || attribute === null || attribute === "undefined") {
      throw new PerspectiveNodeAttributeInvalidError("invalid attribute in options: ", attribute);
    }
  });
  return true;
}

function validateText(text: string) {
    if (text === "") {
      throw new PerspectiveNodeTextEmptyError("comment text cannot be empty");
    }

    if (text.length > 3000) {
      throw new PerspectiveNodeTextTooLongError("comment text must be fewer than 3000 characters");
    }

    return true;
}

export class Client {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getScores(
    text: string,
    options: {attributes: string[], context?: IContext, doNotStore?: boolean, languages?: string[]}
    = {
      attributes: ["SPAM", "TOXICITY"],
      doNotStore: true,
      languages: ["en"],
    },
  ) {
    const {
      attributes,
      context,
      doNotStore,
      languages,
    } = options;

    validateText(text);

    validateAttributes(attributes);

    const requestObject: IAnalyzeCommentRequest = {
      comment: {
        text: striptags(text),
      },
      context,
      doNotStore,
      languages,
      requestedAttributes: buildRequestedAttributes(attributes),
    };

    const perspectiveApiUrl =
    `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${this.apiKey}`;
    const response = await fetchCommentAnalysis(requestObject, perspectiveApiUrl);

    const { attributeScores } = response;
    const scoreValues: IAttributeScores = {};

    for (const attribute in attributeScores) {
      if (attributeScores.hasOwnProperty(attribute)) {
        scoreValues[attribute] = (parseFloat(attributeScores[attribute].summaryScore.value));
      }
    }

    return scoreValues;
  }
}