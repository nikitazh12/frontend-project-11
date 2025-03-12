export default {
  mixed: {
    required: () => ({ key: 'errors.empty' }),
    notOneOf: () => ({ key: 'errors.exists' }),
  },
  string: {
    url: () => ({ key: 'errors.not_url' }),
  },
};
