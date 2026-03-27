declare module 'd3-org-chart' {
  export class OrgChart {
    container(el: any): this;
    data(data: any[]): this;
    nodeWidth(fn: (d: any) => number): this;
    nodeHeight(fn: (d: any) => number): this;
    nodeContent(fn: (d: any) => string): this;
    childrenMargin(fn: (d: any) => number): this;
    compactMarginBetween(fn: (d: any) => number): this;
    compactMarginPair(fn: (d: any) => number): this;
    siblingsMargin(fn: (d: any) => number): this;
    neighbourMargin(fn: (a: any, b: any) => number): this;
    nodeId(fn: (d: any) => string): this;
    parentNodeId(fn: (d: any) => string | null): this;
    svgHeight(h: number): this;
    svgWidth(w: number): this;
    compact(v: boolean): this;
    initialZoom(v: number): this;
    render(): this;
    fit(): this;
    expandAll(): this;
    collapseAll(): this;
    onNodeClick(fn: (d: any) => void): this;
    linkUpdate(fn: (d: any, i: number, arr: any) => void): this;
    setUpToTheRootHighlighted(id: string): this;
    setCentered(id: string): this;
    zoomIn(): this;
    zoomOut(): this;
  }
}
