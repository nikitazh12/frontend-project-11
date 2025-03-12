import onChange from 'on-change';

const createElement = (name, { classes = [], attrs = [], text = '' }) => {
  const element = document.createElement(name);
  element.textContent = text;
  element.classList.add(...classes);
  attrs.forEach(({ key, value }) => {
    element.setAttribute(key, value);
  });
  return element;
};

const handleMessage = (elements, state, i18n) => {
  const { input, feedback } = elements;
  const { error } = state.form;
  input.classList.toggle('is-invalid', error);
  feedback.classList.toggle('text-danger', error);
  feedback.classList.toggle('text-success', !error);
  feedback.textContent = i18n.t(error) || i18n.t('successes.load_rss');
};

const handleForm = (elements, state) => {
  const { status } = state.form;
  const { form, input, button } = elements;

  const mapping = {
    filling: () => {
      input.disabled = false;
      button.disabled = false;
      input.focus();
    },
    sending: () => {
      input.disabled = true;
      button.disabled = true;
    },
    success: () => {
      form.reset();
    },
  };

  return mapping[status]();
};

const handleFeeds = (elements, state, i18n) => {
  const { feedsBox } = elements;

  const card = createElement('div', { classes: ['card', 'border-0'] });
  const cardBody = createElement('div', { classes: ['card-body'] });
  const title = createElement('h2', { classes: ['title', 'h4'], text: i18n.t('feeds') });
  cardBody.append(title);

  const list = createElement('ul', { classes: ['list-group', 'border-0', 'rounded-0'] });
  const items = state.feeds.map((feed) => {
    const li = createElement('li', {
      classes: [
        'list-group-item',
        'border-0',
        'border-end-0',
      ],
    });
    const h = createElement('h3', {
      classes: ['h6', 'm-0'],
      text: feed.title,
    });
    const p = createElement('p', {
      classes: ['m-0', 'small', 'text-black-50'],
      text: feed.descr,
    });

    li.append(h, p);
    return li;
  });

  list.append(...items);
  card.append(cardBody, list);
  feedsBox.replaceChildren(card);
};

const handlePosts = (elements, state, i18n) => {
  const { postsBox } = elements;
  const { posts, ui } = state;

  const card = createElement('div', { classes: ['card', 'border-0'] });
  const cardBody = createElement('div', { classes: ['card-body'] });
  const title = createElement('h2', { classes: ['title', 'h4'], text: i18n.t('posts') });
  cardBody.append(title);

  const list = createElement('ul', { classes: ['list-group', 'border-0', 'rounded-0'] });
  const items = posts.map((post) => {
    const li = createElement('li', {
      classes: [
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      ],
    });
    const a = createElement('a', {
      classes: ui.seenPosts.has(post.id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'],
      attrs: [
        { key: 'href', value: post.link },
        { key: 'data-id', value: post.id },
        { key: 'target', value: '_blank' },
        { key: 'rel', value: 'noopener noreferrer' },
      ],
      text: post.title,
    });
    const button = createElement('button', {
      classes: ['btn', 'btn-outline-primary', 'btn-sm'],
      attrs: [
        { key: 'type', value: 'button' },
        { key: 'data-id', value: post.id },
        { key: 'data-bs-toggle', value: 'modal' },
        { key: 'data-bs-target', value: '#modal' },
      ],
      text: i18n.t('button_view'),
    });

    li.append(a, button);
    return li;
  });

  list.append(...items);
  card.append(cardBody, list);
  postsBox.replaceChildren(card);
};

const handleModal = (state) => {
  const post = state.posts.find(({ id }) => id === state.ui.modal.postId);
  const title = document.querySelector('.modal-title');
  title.textContent = post.title;
  const descr = document.querySelector('.modal-body');
  descr.textContent = post.descr;
  const link = document.querySelector('.modal-footer > a');
  link.setAttribute('href', post.link);
};

export default (elements, state, i18n) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.status':
      case 'form':
        handleForm(elements, state);
        handleMessage(elements, state, i18n);
        break;
      case 'feeds':
        handleFeeds(elements, state, i18n);
        break;
      case 'posts':
      case 'ui.seenPosts':
        handlePosts(elements, state, i18n);
        break;
      case 'ui.modal.postId':
        handleModal(state);
        break;
      default:
        break;
    }
  });

  return watchedState;
};
