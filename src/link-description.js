import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkDescriptionUI from "./link-descriptionui";
import LinkDescriptionEditing from "./link-descriptionediting";

export default class LinkDescription extends Plugin {
	static get requires() {
		return [LinkDescriptionUI, LinkDescriptionEditing];
	}
}
