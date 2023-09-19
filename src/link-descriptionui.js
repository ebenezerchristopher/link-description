import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
	ButtonView,
	ContextualBalloon,
	clickOutsideHandler,
} from "@ckeditor/ckeditor5-ui";
import { first } from "@ckeditor/ckeditor5-utils";
import "../link-description-styles.css";
import FormView from "./link-descriptionview";

export default class LinkDescriptionUI extends Plugin {
	static get requires() {
		return [ContextualBalloon];
	}

	init() {
		const editor = this.editor;

		this._balloon = this.editor.plugins.get(ContextualBalloon);
		this.formView = this._createFormView();

		editor.ui.componentFactory.add("linkWithDescription", () => {
			const button = new ButtonView();

			button.label = "Link-With-Description";
			button.tooltip = true;
			button.withText = true;

			this.listenTo(button, "execute", () => {
				this._showUI();
			});

			return button;
		});
	}

	_createFormView() {
		const editor = this.editor;
		const formView = new FormView(editor.locale);

		this.listenTo(formView, "submit", () => {
			const selection = editor.model.document.selection;

			const href = formView.hrefInputField.fieldView.element.value;
			const linkText = formView.linkTextInputField.fieldView.element.value;
			const linkDescription =
				formView.linkDescriptionInputField.fieldView.element.value;

			const value = {
				href,
				linkDescription,
			};

			editor.model.change((writer) => {
				if (selection.isCollapsed) {
					const text = writer.createText(linkText);
					const element = writer.createElement("linkElement", {
						href: value.href,
						linkDescription: value.linkDescription,
					});

					element._appendChild(text);

					writer.insert(element, selection.getFirstPosition());
				} else {
					const rangeItems = Array.from(selection.getFirstRange().getItems());
					if (rangeItems.length > 1) {
						return;
					}
					const firstNode = rangeItems[0];

					if (
						(firstNode.is("$text") || firstNode.is("$textProxy")) &&
						!firstNode.hasAttribute("linkHref")
					) {
						const text = writer.createText(firstNode.data);
						const range = writer.createRangeOn(firstNode);
						const element = writer.createElement("linkElement", {
							href: value.href,
							linkDescription: value.linkDescription,
						});

						element._appendChild(text);

						writer.remove(firstNode);
						writer.insert(element, range.start);
					} else {
						return;
					}
				}
			});

			// Hide the form view after submit.
			this._hideUI();
		});

		// Hide the form view after clicking the "Cancel" button.
		this.listenTo(formView, "cancel", () => {
			this._hideUI();
		});

		// Hide the form view when clicking outside the balloon.
		clickOutsideHandler({
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [this._balloon.view.element],
			callback: () => this._hideUI(),
		});

		return formView;
	}

	_hideUI() {
		this.formView.hrefInputField.fieldView.value = "";
		this.formView.linkTextInputField.fieldView.value = "";
		this.formView.linkDescriptionInputField.fieldView.value = "";

		this.formView.element.reset();

		this._balloon.remove(this.formView);

		// Focus the editing view after closing the form view.
		this.editor.editing.view.focus();
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		// Set a target position by converting view selection range to DOM.
		target = () =>
			view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());

		return {
			target,
		};
	}

	_showUI() {
		this._balloon.add({
			view: this.formView,
			position: this._getBalloonPositionData(),
		});

		this.formView.focus();
	}
}
