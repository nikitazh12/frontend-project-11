import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';

import resources from './locales/index.js';
import watcher from './watcher.js';
import locales from './locales/locale.js';
import rssParser from './rssParser.js';

const proxy = 'https://allorigins.hexlet.app/';
const updatePosts = 5000;

const addProxy = (url) => {
  const urlWidthProxy = new URL('/get', proxy);
  urlWidthProxy.searchParams.set('disableCache', true);
  urlWidthProxy.searchParams.set('url', url);
  return urlWidthProxy.toString();
};

const getErrorKey = (error) => {
  switch (error.code) {
    case 'ERR_NETWORK':
      return 'errors.network';
    case 'ERR_NORSS':
      return 'errors.no_rss';
    default:
      return 'errors.unknow';
  }
};

const getRSS = (state, url) => {
  const urlWidthProxy = addProxy(url);
  return axios.get(urlWidthProxy)
    .then((response) => {
      const data = rssParser(response.data.contents);
      const feed = { ...data.feed, url, id: uniqueId() };
      const posts = data.posts.map((post) => (
        { ...post, feedId: feed.id, id: uniqueId() }
      ));
      state.feeds.unshift(feed);
      state.posts.unshift(...posts);
    })
    .catch((err) => {
      throw getErrorKey(err);
    });
};

const loadNewPost = (state) => {
  const promises = state.feeds.map((feed) => {
    const urlWidthProxy = addProxy(feed.url);
    return axios.get(urlWidthProxy)
      .then((response) => {
        const data = rssParser(response.data.contents);
        const oldPosts = state.posts.filter(({ feedId }) => feedId === feed.id);
        const newPosts = data.posts
          .filter((post) => (
            !oldPosts.find(({ title, descr }) => post.title === title && post.descr === descr)
          ))
          .map((post) => ({ ...post, feedId: feed.id, id: uniqueId() }));
        state.posts.unshift(...newPosts);
      })
      .catch((err) => {
        throw getErrorKey(err);
      });
  });

  return Promise.all(promises)
    .catch((e) => { console.error(e); })
    .finally(() => { setTimeout(() => loadNewPost(state), updatePosts); });
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[type=submit]'),
    feedback: document.querySelector('.feedback'),
    feedsBox: document.querySelector('.feeds'),
    postsBox: document.querySelector('.posts'),
  };

  const state = {
    form: {
      status: 'filling',
      valid: true,
      error: null,
    },
    feeds: [],
    posts: [],
    ui: {
      seenPosts: new Set(),
      modal: {
        postId: null,
      },
    },
  };

  const i18nInstance = i18next.createInstance();
  const promise = i18nInstance.init({
    lng: 'ru',
    resources,
  })
    .then(() => {
      document.querySelectorAll('[data-i18n]').forEach((element) => {
        // eslint-disable-next-line no-param-reassign
        element.textContent = i18nInstance.t(element.dataset.i18n);
      });
      elements.input.setAttribute('placeholder', i18nInstance.t('form.label'));
    })
    .then(() => {
      yup.setLocale(locales);

      const validateUrl = (value, feeds) => {
        const urls = feeds.map(({ url }) => url);
        const schema = yup.string().url().required().notOneOf(urls);
        return schema.validate(value)
          .then(() => null)
          .catch((err) => err.message.key);
      };

      const watchedState = watcher(elements, state, i18nInstance);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const value = formData.get('url').trim();

        watchedState.form.status = 'sending';

        validateUrl(value, watchedState.feeds)
          .then((err) => {
            if (err) { throw err; }
          })
          .then(() => getRSS(watchedState, value))
          .then(() => {
            watchedState.form = {
              status: 'success',
              valid: true,
              error: null,
            };
          })
          .then(() => {
            watchedState.form.status = 'filling';
          })
          .catch((err) => {
            watchedState.form = {
              status: 'filling',
              valid: false,
              error: err,
            };
          });
      });

      elements.postsBox.addEventListener('click', (e) => {
        if (e.target.dataset.id) {
          const { id } = e.target.dataset;
          watchedState.ui.modal.postId = id;
          watchedState.ui.seenPosts.add(id);
        }
      });

      setTimeout(() => loadNewPost(watchedState), updatePosts);
    });

  return promise;
};
