
import React, { Component } from "react";
import TreeNode from "./TreeNode";
import { convertRemToPixels } from './ConvertRemToPixels';
import { OpcUaBrowseResults, QualifiedName } from './types';
import { ThemeGetter } from './ThemesGetter';
import { GrafanaTheme } from '@grafana/data';
//import { useTheme } from '@grafana/ui';
//import { GrafanaTheme } from '@grafana/data';

//var NodeClass = {
//	DataType: 64,
//	Method: 4,
//	Object: 1,
//	ObjectType: 8,
//	ReferenceType: 32,
//	Unspecified: 0,
//	Variable: 2,
//	VariableType: 16,
//	View: 128,
//};

type Props = {
	browse: (nodeId: string) => Promise<OpcUaBrowseResults[]>;
	rootNodeId: OpcUaBrowseResults,
	ignoreRootNode: boolean,
	closeOnSelect: boolean,
	onNodeSelectedChanged: (nodeId: OpcUaBrowseResults, browsePath: QualifiedName[]) => void;
	closeBrowser: () => void;
};

type State = {
	fetchedChildren: boolean,
	rootNode: OpcUaBrowseResults,
	children: OpcUaBrowseResults[],
	theme: GrafanaTheme | null;
}



/**
 * Displays nodes in a tree and allows users to select an entity for display.
 */
export class Browser extends Component<Props, State> {
	/**
	 *
	 * @param {*} props sets the data structure
	 */
	constructor(props: Props) {
		super(props);
		this.state = {
			rootNode: {
				browseName: { name: "", namespaceUrl: "" }, displayName: "", isForward: false, nodeClass: -1, nodeId: ""
			},
			children: [],
			fetchedChildren: false,
			theme: null
		}
	}

	handleClose = () => {
		this.props.closeBrowser();
	}

	handleHoverClose = () => {
	}

	handleUnhoverClose = () => {
	}

	nodeSelect = (node: OpcUaBrowseResults, browsePath: QualifiedName[]) => {
		this.props.onNodeSelectedChanged(node, browsePath);
		if (this.props.closeOnSelect)
			this.props.closeBrowser();
	}


	renderNode = (node: OpcUaBrowseResults) => {
		return <TreeNode
			node={node}
			browse={this.props.browse}
			onNodeSelect={this.nodeSelect}
			level={0}
			marginRight={4}
			parentNode={null}
		/>;
	}


	renderNodes = (rootNodeId: OpcUaBrowseResults, ignoreRoot: boolean) => {

		if (!ignoreRoot)
			return this.renderNode(rootNodeId);
		else {
			if (!this.state.fetchedChildren) {
				this.props.browse(rootNodeId.nodeId).then((response) => { this.setState({ children: response, fetchedChildren: true }) });
				return <></>;
			}
			else {
				return this.state.children.map(a => this.renderNode(a));
			}
		}
	}

	onTheme = (theme: GrafanaTheme) => {
		if (this.state.theme == null && theme != null) {
			this.setState({ theme: theme });
		}
	}

	/**
	 * Renders the component.
	 */
	render() {
		const rootNodeId = this.props.rootNodeId;
		if (this.state.rootNode.nodeId != rootNodeId.nodeId) {
			this.setState({ children: [], fetchedChildren: false, rootNode: rootNodeId });
		}
		let bg: string = "";
		if (this.state.theme != null)
		{
			bg = this.state.theme.colors.bg2;
		}
		return (
			<div style={{
        background: bg,
        height: "100%",
        width: "100%"
			}}>
				<ThemeGetter onTheme={this.onTheme} />
				<span
					data-id="Treeview-CloseSpan"
					onClick={() => this.handleClose()}
					onMouseOver={this.handleHoverClose}
					onMouseOut={this.handleUnhoverClose}
					//ref={(spn) => (this.closeSpan = spn)}
					style={{
						//border: this.props.theme.colors.border1,
						cursor: "pointer",
            padding: convertRemToPixels("0.0rem")
					}}
				>
				</span>
				<div
          data-id="Treeview-ScrollDiv"

          style={{
            height: "100%",
						overflowX: "hidden",
            overflowY: "auto"
					}}
				>
					{this.renderNodes(rootNodeId, this.props.ignoreRootNode)}
				</div>
			</div>
		);
	}
}

	///**
	// * When a node is re-clicked on, the tree should renavigate to the location of the node.
	// */
	//renavigateChildNodes = () => {
	//	const { target } = this.props;
	//	if (!target) {
	//		return;
	//	}

	//	const { renavigateNodeChain } = target;
	//	if (!renavigateNodeChain || renavigateNodeChain.length <= 0) {
	//		return;
	//	}

	//	const { nodes } = this.state;
	//	this.renavigateNextNode(renavigateNodeChain, nodes);

	//	target.renavigateNodeChain = null;

	//	const { changed } = this.props;
	//	if (changed) {
	//		changed();
	//	}
	//};

	///**
	// * Saves the renavigated nodes to the state.
	// */
	//saveRenavigatedNodes = (nodes: Array<Object>) => {
	//	this.setState({ nodes });
	//};

	///**
	// * Takes a value from the node chain and loads its children.
	// */
	//renavigateNextNode = (renavigateNodeChain, nodes) => {
	//	if (!renavigateNodeChain || renavigateNodeChain.length <= 1) {
	//		return nodes;
	//	}

	//	const node = renavigateNodeChain[0];

	//	const that = this;

	//	const { datasource } = this.props;
	//	datasource
	//		.getChildrenFromServer(node.nodeId)
	//		.then(function (foundDataArray) {
	//			// Empty parent children list
	//			nodes[node.path].children = [];

	//			for (const item of foundDataArray) {
	//				let newPath = node.path + "@#£$" + item.displayName;
	//				let newNode = {
	//					children: [],
	//					isRoot: false,
	//					nodeId: item.nodeId,
	//					path: newPath,
	//					type: checkType(item.nodeClass),
	//				};
	//				nodes[newPath] = newNode;

	//				const newChildren = nodes[node.path].children.concat(
	//					newPath
	//				);
	//				nodes[node.path].children = newChildren;
	//				nodes[node.path].isOpen = true;

	//				nodes[node.path].isOpen = true;
	//			}
	//		})
	//		.catch((error) => {
	//			console.error(error);
	//		})
	//		.finally(() => {
	//			renavigateNodeChain.splice(0, 1);

	//			if (renavigateNodeChain.length > 0) {
	//				nodes = that.renavigateNextNode(renavigateNodeChain, nodes);
	//			}

	//			this.saveRenavigatedNodes(nodes);
	//		});
	//};



	///**
	// * Called when the user closes the tree.
	// */
	//handleClose = () => {
	//	let { target } = this.props;

	//	target.treeOpened = false;

	//	const { changed } = this.props;
	//	if (changed) {
	//		changed();
	//	}
	//};

	///**
	// * Called when the user hovers over the close button.
	// */
	//handleHoverClose = () => {
	//	this.closeSpan.style.backgroundColor = "lightgrey";
	//};

	///**
	// * Called when the user moves away from the close button.
	// */
	//handleUnhoverClose = () => {
	//	this.closeSpan.style.backgroundColor = "transparent";
	//};

///**
// *
// * @param {*} nodeClass decides what type of file we have
// */
//function checkType(nodeClass) {
//	if ((nodeClass & NodeClass.Variable) === NodeClass.Variable) {
//		// 2
//		return "file";
//	}
//	if ((nodeClass & NodeClass.Object) === NodeClass.Object) {
//		// 1
//		return "folder";
//	}
//	if ((nodeClass & NodeClass.ObjectType) === NodeClass.ObjectType) {
//		// 8
//		return "objecttype";
//	}

//	return "unspecified";
//}
