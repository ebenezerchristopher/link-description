// abbreviation/abbreviationview.js

import {
	View,
	LabeledFieldView,
	createLabeledInputText,
	ButtonView,
	submitHandler,
} from "@ckeditor/ckeditor5-ui";
import { icons } from "@ckeditor/ckeditor5-core";

export default class FormView extends View {
	constructor(locale) {
		super(locale);

		this.hrefInputField = this._createInput("link");
		this.linkTextInputField = this._createInput("link-text");
		this.linkDescriptionInputField = this._createInput("link-description");

		this.saveButtonView = this._createButton(
			"Save",
			icons.check,
			"ck-button-save"
		);
		// Set the type to 'submit', which will trigger
		// the submit event on entire form when clicked.
		this.saveButtonView.type = "submit";

		this.cancelButtonView = this._createButton(
			"Cancel",
			icons.cancel,
			"ck-button-cancel"
		);

		// delegate the execute event of the button to the view
		this.cancelButtonView.delegate("execute").to(this, "cancel");

		this.childViews = this.createCollection([
			this.hrefInputField,
			this.linkTextInputField,
			this.linkDescriptionInputField,
			this.saveButtonView,
			this.cancelButtonView,
		]);

		this.setTemplate({
			tag: "form",
			attributes: {
				class: ["ck", "ck-linkWithDescription-form"],
				tabindex: "-1",
			},
			children: this.childViews,
		});
	}

	render() {
		super.render();

		// Submit the form when the user clicked the save button
		// or pressed enter in the input.
		submitHandler({
			view: this,
		});
	}

	focus() {
		this.childViews.first.focus();
	}

	_createInput(label) {
		const labeledInput = new LabeledFieldView(
			this.locale,
			createLabeledInputText
		);

		labeledInput.label = label;

		return labeledInput;
	}

	_createButton(label, icon, className) {
		const button = new ButtonView();

		button.set({
			label,
			icon,
			tooltip: true,
			class: className,
		});

		return button;
	}
}
