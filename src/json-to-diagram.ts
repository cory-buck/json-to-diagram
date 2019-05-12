export interface Json {
    [prop: string]: string | number | Json
}

export function jsonToDiagram(target: HTMLElement, json: Json) {

    //STYLES 

    const nodeNonEmptyStyle = {
        position: "relative",
        display: "flex",
        alignItems: "center",
        marginBottom: "1rem"
    }

    const nodeEmptyStyle = {
        position: "relative",
        display: "flex"
    }

    const nodeIconBaseStyle = {
        display: "inline-block",
        borderRadius: "50%",
        width: "10px",
        height: "10px",
        border: "1px solid black",
        boxSizing: "border-box",
        verticalAlign: "middle"
    }

    const nodeEmptyIconStyle = {
        backgroundColor: "rgba(57,255,20,.3)"
    }

    const nodeNonEmptyIconStyle = {
        backgroundColor: "rgba(255,131,0,.3)"
    }

    const nodeHeaderStyle = {
        display: "inline-block",
        cursor: "pointer"
    }

    const nodeTitleStyle = {
        padding: '.1rem .2rem',
        marginBottom: "1rem"
    }

    const nodeBodyStyle = {
        paddingLeft: "2rem"
    }

    const connector = {
        position: "absolute",
        boxSizing: "border-box",
        marginBottom: "-1px"
    }

    const connectorBlock = {
        height: "50%",
        boxSizing: "border-box",
        float: "left"
    }

    const connectorRightUp = {
        borderBottom: "1px solid rgb(0,0,0,.3)",
        borderRight: "1px solid rgb(0,0,0,.3)",
        borderBottomRightRadius: "100%",
        marginRight: "-1px"
    }

    const connectorRightDown = {
        borderTop: "1px solid rgb(0,0,0,.3)",
        borderRight: "1px solid rgb(0,0,0,.3)",
        borderTopRightRadius: "100%",
        marginRight: "-1px"
    }

    const connectorUpRight = {
        borderTop: "1px solid rgb(0,0,0,.3)",
        borderLeft: "1px solid rgb(0,0,0,.3)",
        borderTopLeftRadius: "100%",
        marginLeft: "-1px"
    }

    const connectorDownRight = {
        borderBottom: "1px solid rgb(0,0,0,.3)",
        borderLeft: "1px solid rgb(0,0,0,.3)",
        borderBottomLeftRadius: "100%",
        marginLeft: "-1px"
    }

    const straightConnectorStyle = {
        position: "absolute",
        display: "inline-block",
        borderTop: "1px solid rgba(0,0,0,.3)",
        boxSizing: "borderBox",
        height: "1px"
    };

    const popupStyle = {
        position:"absolute",
        padding: ".25rem .5rem",
        border: "1px solid rgba(0,0,0,.3)",
        borderRadius: ".25rem",
        display: "none",
        boxShadow: "1px 1px 2px rgba(0,0,0,.3)",
        zIndex: "100",
        backgroundColor: "white"
    }

    //JSON TO DIAGRAM

    function createNode(parent: HTMLElement, name: string, json: Json | string | number): HTMLElement {
        const nodeHasChildren = typeof json === "object";

        const node = createElement('div', nodeHasChildren ? nodeNonEmptyStyle : nodeEmptyStyle);
        addClass(node, "node");

        if (parent.classList.contains('node-body')){
            addClass(node, 'child-node');            
        }
        appendChild(parent, node);

        if(!nodeHasChildren) addClass(node, 'leaf-node');

        appendChild(node, createNodeHeader(name, nodeHasChildren));
        createNodeBody(node, json);

        return node;
    }

    function createNodeHeader(name: string, hasChildren: boolean) {
        const nodeHeader = createElement('div', nodeHeaderStyle);
        addClass(nodeHeader, "node-header");
        appendChild(nodeHeader, createNodeIcon(hasChildren));
        appendChild(nodeHeader,  createNodeTitle(name));
        return nodeHeader;
    }

    function createNodeIcon(hasChildren: boolean): HTMLElement {
        return createElement('span', Object.assign(
            {},
            nodeIconBaseStyle,
            hasChildren
                ? nodeNonEmptyIconStyle
                : nodeEmptyIconStyle
        ));
    }

    function createNodeTitle(name: string) {
        const elm = createElement('span', nodeTitleStyle);
        elm.innerText = name;
        return elm;
    }

    function createNodeBody(parent: HTMLElement, json: Json | string | number) {
        const body = createElement('div', nodeBodyStyle);
        addClass(body, "node-body");
        appendChild(parent, body);

        if (typeof json === "object") {
            const keys = Object.getOwnPropertyNames(json);
            //add child nodes
            for (let i = 0; i < keys.length; i++) {
                createNode(body, keys[i], json[keys[i]]);
            }
            //add connections
            for (let i = 0; i < keys.length; i++) {
                createConnection(parent, parent.children[1].children[i] as HTMLElement);
            }
        } else {
            createNodeContentPopup(parent, json.toString());
        }
    }

    function createNodeContentPopup(parent: HTMLElement, value: string){
        const popup = createElement('span', Object.assign(
            {
                left: (parent.children[0] as HTMLElement).offsetWidth + "px"
            },
            popupStyle
        ));
        appendChild(parent as HTMLElement, popup);
        popup.innerText = value;

        parent.children[0].addEventListener('mouseenter', ()=>{ popup.style.display = "" });
        parent.children[0].addEventListener('mouseleave', ()=>{ popup.style.display = "none" });
    }

    function createConnection(parent: HTMLElement, child: HTMLElement) {

        const pH = parent.children[0] as HTMLElement; //parent header
        const cH = child.children[0] as HTMLElement   //child header

        const p1 = {
            x: pH.offsetLeft,
            y: pH.offsetTop + pH.offsetHeight / 2
        }

        const p2 = {
            x: cH.offsetLeft,
            y: child.offsetTop + child.offsetHeight / 2 + 1
        }

        const cStyle = {
            left: pH.offsetWidth + "px",
            top: Math.min(p1.y, p2.y) + "px",
            height: (Math.max(p1.y, p2.y) - Math.min(p1.y, p2.y)) + "px",
            width: child.offsetLeft - pH.offsetWidth + "px"
        }

        if (Math.abs(p1.y - p2.y) > 5) {
            if (p1.y < p2.y) {
                parent.appendChild(createArrowDownConnector(cStyle));
            } else {
                parent.appendChild(createArrowUpConnector(cStyle));
            }
        } else {
            parent.append(createStraightConnector(cStyle));
        }
    }

    function createArrowUpConnector(cStyle) {
        return createConnector(
            cStyle,
            {},
            connectorUpRight,
            connectorRightUp,
            {}
        )
    }

    function createArrowDownConnector(cStyle) {
        return createConnector(
            cStyle,
            connectorRightDown,
            {},
            {},
            connectorDownRight
        )
    }

    function createStraightConnector(cStyle) {
        return createElement('span', Object.assign({}, straightConnectorStyle, {
            top: cStyle.top,
            left: cStyle.left,
            width: cStyle.width
        }));
    }

    function createConnector(
        cStyle: any,
        style1: Json,
        style2: Json,
        style3: Json,
        style4: Json) {
        let c = createElement('div', Object.assign({}, connector, cStyle));
        addClass(c, 'connector');
        appendChild(c, createElement('span', Object.assign({ width: "25%" }, connectorBlock, style1)));
        appendChild(c, createElement('span', Object.assign({ width: "75%" }, connectorBlock, style2)));
        appendChild(c, createElement('span', Object.assign({ width: "25%" }, connectorBlock, style3)));
        appendChild(c, createElement('span', Object.assign({ width: "75%" }, connectorBlock, style4)));
        return c;
    }


    //HTML ELEMENT MANIPULATION 

    function createElement(tagName: string, style?: Json) {
        const elm = document.createElement(tagName);
        if (style) setStyle(elm, style);
        return elm;
    }

    function setStyle(elm: HTMLElement, json: Json) {
        const keys: string[] = Object.getOwnPropertyNames(json);
        for (let i = 0; i < keys.length; i++) {
            elm.style[keys[i]] = json[keys[i]];
        }
    }

    function appendChild(parent: HTMLElement, child: HTMLElement) {
        parent.appendChild(child);
    }

    function removeChild(parent: HTMLElement, child: HTMLElement){
        parent.removeChild(child);
    }

    function addClass(elm: HTMLElement, className: string) {
        elm.classList.add(className);
    }

    //BUILD DIAGRAM
    let building = false;
    let buildPending = false;
    function buildDiagram(container: HTMLElement){
        if(building){
            buildPending = true;
            return;
        }
        building = true;

        for(let child of container.children){
            removeChild(container, child as HTMLElement);
        }

        console.time('BUILT JSON DIAGRAM');
        const rootKeys = Object.getOwnPropertyNames(json);
        for(let i = 0; i < rootKeys.length; i++){
            createNode(container, rootKeys[i], json[rootKeys[i]]);
        }    
        console.timeEnd('BUILT JSON DIAGRAM');

        //THROTTLE PENDING BUILDS
        setTimeout(()=>{ 
            building = false;
            if(buildPending){
                buildPending = false;
                buildDiagram(container);
            }
        }, 50);
    }

    //INITIALIZE
    function init(){
        if (!target) throw new Error("'target' was not provided.");
        if (!json) throw new Error("'json' was not provided.");
        
        const container = createElement('div', { overflow: "auto", padding: "50px" });
        appendChild(target, container);
        //first build of diagram
        buildDiagram(container as HTMLElement);
        //listen for resize, rebuild as needed
        window.addEventListener('resize', ()=>{ buildDiagram(container); });
    }

    init();
}