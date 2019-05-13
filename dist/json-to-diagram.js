"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function (global) {
    //HTML ELEMENT MANIPULATION 
    function createElement(tagName, style) {
        const elm = document.createElement(tagName);
        if (style) {
            const keys = Object.getOwnPropertyNames(style);
            for (let i = 0; i < keys.length; i++) {
                elm.style[keys[i]] = style[keys[i]];
            }
        }
        return elm;
    }
    //STYLES 
    const nodeNonEmptyStyle = {
        position: "relative",
        display: "flex",
        alignItems: "center",
        marginBottom: "1rem"
    };
    const nodeEmptyStyle = {
        position: "relative",
        display: "flex"
    };
    const nodeIconBaseStyle = {
        display: "inline-block",
        borderRadius: "50%",
        width: "10px",
        height: "10px",
        border: "1px solid black",
        boxSizing: "border-box",
        verticalAlign: "middle"
    };
    const nodeEmptyIconStyle = {
        backgroundColor: "rgba(57,255,20,.3)"
    };
    const nodeNonEmptyIconStyle = {
        backgroundColor: "rgba(255,131,0,.3)"
    };
    const nodeHeaderStyle = {
        display: "inline-block",
        cursor: "pointer"
    };
    const nodeTitleStyle = {
        padding: '.1rem .2rem',
        marginBottom: "1rem"
    };
    const nodeBodyStyle = {
        paddingLeft: "2rem"
    };
    const connector = {
        position: "absolute",
        boxSizing: "border-box",
        marginBottom: "-1px"
    };
    const connectorBlock = {
        height: "50%",
        boxSizing: "border-box",
        float: "left"
    };
    const connectorRightUp = {
        borderBottom: "1px solid rgb(0,0,0,.3)",
        borderRight: "1px solid rgb(0,0,0,.3)",
        borderBottomRightRadius: "100%",
        marginRight: "-1px"
    };
    const connectorRightDown = {
        borderTop: "1px solid rgb(0,0,0,.3)",
        borderRight: "1px solid rgb(0,0,0,.3)",
        borderTopRightRadius: "100%",
        marginRight: "-1px"
    };
    const connectorUpRight = {
        borderTop: "1px solid rgb(0,0,0,.3)",
        borderLeft: "1px solid rgb(0,0,0,.3)",
        borderTopLeftRadius: "100%",
        marginLeft: "-1px"
    };
    const connectorDownRight = {
        borderBottom: "1px solid rgb(0,0,0,.3)",
        borderLeft: "1px solid rgb(0,0,0,.3)",
        borderBottomLeftRadius: "100%",
        marginLeft: "-1px"
    };
    const straightConnectorStyle = {
        position: "absolute",
        display: "inline-block",
        borderTop: "1px solid rgba(0,0,0,.3)",
        boxSizing: "borderBox",
        height: "1px"
    };
    const popupStyle = {
        position: "absolute",
        padding: ".25rem .5rem",
        border: "1px solid rgba(0,0,0,.3)",
        borderRadius: ".25rem",
        display: "none",
        boxShadow: "1px 1px 2px rgba(0,0,0,.3)",
        zIndex: "100",
        backgroundColor: "white"
    };
    function jsonToDiagram(target, json) {
        ///INITIALIZE
        let building = false;
        let buildPending = false;
        //USED TO REMOVE HOVER LISTENERS
        let cleanUpFns = [];
        let container;
        let currentJson;
        function init() {
            if (!target)
                throw new Error("'target' was not provided.");
            if (!json)
                throw new Error("'json' was not provided.");
            //init container
            container = createElement('div', { overflow: "auto", padding: "50px" });
            target.appendChild(container);
            //init json
            currentJson = json;
            //first build of diagram
            buildDiagram();
            //listen for resize, rebuild as needed
            window.addEventListener('resize', rebuild);
            return {
                setJson,
                rebuild,
                destroy
            };
        }
        function buildDiagram() {
            if (building) {
                buildPending = true;
                return;
            }
            building = true;
            console.time('BUILT JSON DIAGRAM');
            const _json = currentJson;
            const rootKeys = Object.getOwnPropertyNames(_json);
            for (let i = 0; i < rootKeys.length; i++) {
                createNode(container, rootKeys[i], _json[rootKeys[i]]);
            }
            console.timeEnd('BUILT JSON DIAGRAM');
            //THROTTLE PENDING BUILDS
            setTimeout(() => {
                building = false;
                if (buildPending) {
                    buildPending = false;
                    rebuild();
                }
            }, 50);
        }
        function cleanup() {
            //remove event listeners for all leaf nodes
            for (let i = 0; i < cleanUpFns.length; i++) {
                cleanUpFns[i]();
            }
            cleanUpFns = [];
            //remove child nodes
            while (container.children.length > 0) {
                container.removeChild(container.children[0]);
            }
        }
        function rebuild() {
            cleanup();
            buildDiagram();
        }
        function destroy() {
            //remove resize listener
            window.removeEventListener('resize', rebuild);
            //cleanup
            cleanup();
        }
        function setJson(json) {
            if (!json)
                throw new Error("'json' was not provided.");
            currentJson = json;
            rebuild();
        }
        //JSON TO DIAGRAM HELPERS
        function createNode(parent, name, json) {
            const nodeHasChildren = typeof json === "object";
            const node = createElement('div', nodeHasChildren ? nodeNonEmptyStyle : nodeEmptyStyle);
            node.classList.add("node");
            if (parent.classList.contains('node-body')) {
                node.classList.add("child-node");
            }
            parent.appendChild(node);
            if (!nodeHasChildren)
                node.classList.add("leaf-node");
            node.appendChild(createNodeHeader(name, nodeHasChildren));
            createNodeBody(node, json);
            return node;
        }
        function createNodeHeader(name, hasChildren) {
            const nodeHeader = createElement('div', nodeHeaderStyle);
            nodeHeader.classList.add("node-header");
            nodeHeader.appendChild(createNodeIcon(hasChildren));
            nodeHeader.appendChild(createNodeTitle(name));
            return nodeHeader;
        }
        function createNodeIcon(hasChildren) {
            return createElement('span', Object.assign({}, nodeIconBaseStyle, hasChildren
                ? nodeNonEmptyIconStyle
                : nodeEmptyIconStyle));
        }
        function createNodeTitle(name) {
            const elm = createElement('span', nodeTitleStyle);
            elm.innerText = name;
            return elm;
        }
        function createNodeBody(parent, json) {
            const body = createElement('div', nodeBodyStyle);
            body.classList.add("node-body");
            parent.appendChild(body);
            if (typeof json === "object") {
                const keys = Object.getOwnPropertyNames(json);
                //add child nodes
                for (let i = 0; i < keys.length; i++) {
                    createNode(body, keys[i], json[keys[i]]);
                }
                //add connections
                for (let i = 0; i < keys.length; i++) {
                    createConnection(parent, parent.children[1].children[i]);
                }
            }
            else {
                createNodeContentPopup(parent, json.toString());
            }
        }
        function createNodeContentPopup(parent, value) {
            const popup = createElement('span', Object.assign({
                left: parent.children[0].offsetWidth + "px"
            }, popupStyle));
            const showPopup = () => { popup.style.display = ""; };
            const hidePopup = () => { popup.style.display = "none"; };
            parent.appendChild(popup);
            popup.innerText = value;
            parent.children[0].addEventListener('mouseenter', showPopup);
            parent.children[0].addEventListener('mouseleave', hidePopup);
            cleanUpFns.push(() => {
                parent.children[0].removeEventListener('mouseenter', showPopup);
                parent.children[0].removeEventListener('mouseleave', hidePopup);
            });
        }
        function createConnection(parent, child) {
            const pH = parent.children[0]; //parent header
            const cH = child.children[0]; //child header
            const p1 = {
                x: pH.offsetLeft,
                y: pH.offsetTop + pH.offsetHeight / 2
            };
            const p2 = {
                x: cH.offsetLeft,
                y: child.offsetTop + child.offsetHeight / 2 + 1
            };
            const cStyle = {
                left: pH.offsetWidth + "px",
                top: Math.min(p1.y, p2.y) + "px",
                height: (Math.max(p1.y, p2.y) - Math.min(p1.y, p2.y)) + "px",
                width: child.offsetLeft - pH.offsetWidth + "px"
            };
            if (Math.abs(p1.y - p2.y) > 5) {
                if (p1.y < p2.y) {
                    parent.appendChild(createArrowDownConnector(cStyle));
                }
                else {
                    parent.appendChild(createArrowUpConnector(cStyle));
                }
            }
            else {
                parent.appendChild(createStraightConnector(cStyle));
            }
        }
        function createArrowUpConnector(cStyle) {
            return createConnector(cStyle, {}, connectorUpRight, connectorRightUp, {});
        }
        function createArrowDownConnector(cStyle) {
            return createConnector(cStyle, connectorRightDown, {}, {}, connectorDownRight);
        }
        function createStraightConnector(cStyle) {
            return createElement('span', Object.assign({}, straightConnectorStyle, {
                top: cStyle.top,
                left: cStyle.left,
                width: cStyle.width
            }));
        }
        function createConnector(cStyle, style1, style2, style3, style4) {
            let c = createElement('div', Object.assign({}, connector, cStyle));
            c.classList.add("node-connector");
            c.appendChild(createElement('span', Object.assign({ width: "25%" }, connectorBlock, style1)));
            c.appendChild(createElement('span', Object.assign({ width: "75%" }, connectorBlock, style2)));
            c.appendChild(createElement('span', Object.assign({ width: "25%" }, connectorBlock, style3)));
            c.appendChild(createElement('span', Object.assign({ width: "75%" }, connectorBlock, style4)));
            return c;
        }
        return init();
    }
    global.jsonToDiagram = jsonToDiagram;
})(window);
