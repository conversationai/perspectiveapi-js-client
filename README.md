# perspectiveapi-js-client

A simple example JS/TS client library for the [Perspective API](https://www.perspectiveapi.com/).
This client can be used to send text to the API and get back the scores for a set of model attributes.

## Usage

First, you'll need an API key from ConversationAI's [Perspective API](https://www.perspectiveapi.com/).

```
const { Client } = require("@conversationai/perspectiveapi-js-client");
const client = new Client(YOUR_API_KEY);
const results = client.getScores(text, options);
```

## Methods

This client exposes one method, getScores.

`getScores(text, options);`

### Parameters

`text` *(Required)*

A string between 1 and 3000 characters representing a piece of text (e.g. a comment on an article) to be analyzed by Perspective API.

`options`

An optional object that specifies options for the API.

Accepted keys in the options object are:

Field                    | Description
-----                    | -----------
`context.entries`        | A list of objects providing the context for `text`. Defaults to `null`, equivalent to an empty list.
`context.entries[].text` | The text of a context object.
`attributes`             | An array of strings specifying the attributes to get scores for. See the [Perspective docs](https://github.com/conversationai/perspectiveapi/blob/master/api_reference.md#models) for a list of available attributes. Default: `["SPAM", "TOXICITY"]`
`languages`              | A list of [ISO 631-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) two-letter language codes specifying the language(s) that `text` is in (for example, "en", "es", "fr", etc). Default: `["EN"]`
`doNotStore`             | Whether the API is permitted to store `text` and `context` from this request. Default: `true`
`stripHtml`              | A boolean specifying whether to strip html tags from `text`. Default: `true`

### Return Value

A promise that rejects with an Error object containing a `message` property specifying the error, or resolves to an object of attribute scores of the shape `[attribute: string]: number`, where the number is a float between 0 and 1. Here's an example result:
```
{
  TOXICITY: 0.65,
  SPAM: 0.25
}
```
The above result would mean that the Perspective API suggests the text is 65% likely to be toxic and 25% likely to be spam.

## Tests

Run `yarn test` to run the test suite.
