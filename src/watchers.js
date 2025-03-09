import onChange from 'on-change'

export default (initState, elements, i18next) => {
	const handleForm = () => {
		const { form: { error, valid } } = initState;
		const { input, feedback } = elements;

		if (valid) {
			input.classList.remove('is-invalid');
		} else {
			input.classList.add('is-invalid');
			feedback.classList.add('text-danger');
			feedback.textContent = i18next.t(`errors.${error}`);
		}
	};

	const handleLoadingProcessStatus = () => {
		const { loadingProcess } = state;
		const { submit, input, feedback } = elements;

		switch (loadingProcess.status) {
			case 'failed':
				submit.disabled = false;
				input.removeAttribute('readonly');
				feedback.classList.add('text-danger');
				feedback.textContent = i18next.t([`errors.${loadingProcess.error}`, 'errors.unknown']);
				break;
			case 'idle':
				submit.disabled = false;
				input.removeAttribute('readonly');
				input.value = '';
				feedback.classList.add('text-success');
				feedback.textContent = i18next.t('loading-success');

				input.focus();
				break;
			case 'loading':
				submit.disabled = true;
				input.setAttribute('readonly', true);
				feedback.classList.remove('text-success');
				feedback.classList.remove('text-danger');
				feedback.textContent = '';
				break;
			default:
				throw new Error(`Unknown loadingProcess status: '${loadingProcess.status}'`);

		}
	};

	const handleFeeds = (state) => {
		const { feeds } = state;
		const { feedsBox } = elements;

		const fragmentStructure = document.createElement('div');
		fragmentStructure.classList.add('card', 'border-0');
		fragmentStructure.innerHTML = `
			<div class = 'card-body'></div>
		`;

		const feedsTitle = document.createElement('h2');
		feedsTitle.classList.add('card-title', 'h4');
		feedsTitle.textContent = i18next.t('feeds');
		fragmentStructure.querySelector('.card-body').appendChild(feedsTitle);

		const feedsList = document.createElement('ul');
		feedsList.classList.add('list-group', 'border-0', 'rounded-0');

		const feedsListItems = feeds.map((feed) => {
			const element = document.createElement('li');
			element.classList.add('list-group-item', 'border-0', 'border-end-0');
			const title = document.createElement('h3');
			title.classList.add('h6', 'm-0');
			title.textContent = feed.title;
			const description = document.createElement('p');
			description.classList.add('m-0', 'small', 'text-black-50');
			description.textContent = feed.description;
			element.append(title, description);
			return element
		});

		feedsList.append(...feedsListItems);
		fragmentStructure.appendChild(feedsList);
		feedsBox.innerHTML = '';
		feedsBox.appendChild(fragmentStructure);
	}
	

	const watchedState = onChange(initState, (path) => {
		switch (path) {
			case 'form':
				handleForm();
				break;
			default:
				break;
		}
	});

	return watchedState;
}