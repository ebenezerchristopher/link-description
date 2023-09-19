import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export default class LinkDescriptionEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register("linkElement", {
			isLimit: true,
			isObject: true,
			isSelectable: true,
		});

		schema.extend("linkElement", {
			allowAttributes: ["linkDescription", "href"],
		});
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for("dataDowncast").elementToStructure({
			model: {
				name: "linkElement",
			},
			// Callback function provides access to the model element
			// and the DowncastWriter.
			view: (modelElement, conversionApi) => {
				const { writer } = conversionApi;
				const href = modelElement.getAttribute("href");
				const linkDescription = writer.createText(
					modelElement.getAttribute("linkDescription")
				);

				const anchorSpan = writer.createContainerElement(
					"span",
					{
						class: "tolltip-anchor-content",
					},
					[writer.createSlot()]
				);

				const anchorContainerSpan = writer.createContainerElement(
					"span",
					{
						class: "tolltip-anchor",
					},
					[anchorSpan]
				);

				const wrapperSpan = writer.createContainerElement(
					"span",
					{
						class: "tolltip-content",
					},
					[linkDescription]
				);

				const wrapperContainerSpan = writer.createContainerElement(
					"span",
					{
						class: "tolltip-wrapper",
					},
					[wrapperSpan]
				);

				const containerLink = writer.createContainerElement(
					"a",
					{
						href,
						class: "tolltip-link",
					},
					[anchorContainerSpan, wrapperContainerSpan]
				);

				return containerLink;
			},
		});

		conversion.for("editingDowncast").elementToStructure({
			model: {
				name: "linkElement",
			},
			// Callback function provides access to the model element
			// and the DowncastWriter.
			view: (modelElement, conversionApi) => {
				const { writer } = conversionApi;
				const href = modelElement.getAttribute("href");

				const containerLink = writer.createContainerElement(
					"a",
					{
						href,
					},
					[writer.createSlot()]
				);

				return containerLink;
			},
		});

		// Conversion from a view element to a model element.
		conversion.for("upcast").elementToElement({
			view: {
				name: "a",
				classes: "tolltip-link",
			},
			model: (viewElement, conversionApi) => {
				const modelWriter = conversionApi.writer;
				const href = viewElement.getAttribute("href");
				const linkDescription = writer.createText(
					viewElement.getChild(1).getChild(0).getChild(0).data
				);
				const text = writer.createText(
					viewElement.getChild(0).getChild(0).getChild(0).data
				);

				const element = modelWriter.createElement("linkElement", {
					href,
					linkDescription,
				});

				element._appendChild(text);

				return element;
			},
			converterPriority: "high",
		});
	}
}
