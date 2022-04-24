const { Router, json, urlencoded } = require("express");
const needle = require("needle");
const restAuthMiddleware = require("../middleware/restAuthMiddleware");
require("dotenv").config();

const router = Router();

router.use(json());
router.use(urlencoded({ extended: true }));

const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=context_annotations,created_at&expansions=author_id&user.fields=created_at,profile_image_url";

const setRules = async (rules) => {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
  });

  if (response.statusCode === 201) {
    return response.body;
  }

  throw new Error(response.body);
};

const getRules = async () => {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
  });
  if (response.statusCode === 200) {
    return response.body;
  }
  throw new Error(response.body);
};

const deleteRules = async (rulesData) => {
  if (!Array.isArray(rulesData)) {
    return null;
  }

  const ids = rulesData.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }
  return response.body;
};

const streamTweets = (retries, socket) => {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
    },
    timeout: 20000,
  });

  stream
    .on("data", (data) => {
      try {
        const jsonData = JSON.parse(data);
        console.log(jsonData);
        socket.emit("tweets", jsonData);
        retries = 0;
      } catch (error) {
        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(data.detail);
          socket.emit("streamLimitError", data.detail);
          //   process.exit(1);
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    })
    .on("err", (error) => {
      if (error.code !== "ECONNRESET") {
        console.log(error.code);
        socket.emit("streamError", error.code);
        process.exit(1);
      } else {
        //reconnect
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamTweets(++retries, socket);
        }, 2 ** retries);
      }
    });

  return stream;
};

const startStream = async (socket) => {
  try {
    return streamTweets(0, socket);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

router.post("/rules", restAuthMiddleware, async (req, res) => {
  const rules = req.body.rules;

  if (!Array.isArray(rules)) {
    return res.status(400).json({ error: "Rules must be an array" });
  }

  try {
    //get rules currently applied to stream
    const currentRules = await getRules();
    //delete rules currently applied to stream
    await deleteRules(currentRules.data);
    //set new rules
    const rulesData = await setRules(rules);
    return res.status(201).json(rulesData);
  } catch (error) {
    console.log("error setting rules", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
module.exports.startStream = startStream;
