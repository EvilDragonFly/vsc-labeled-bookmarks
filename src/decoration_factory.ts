import * as path from 'path';
import * as vscode from 'vscode';
import { DecorationRangeBehavior, OverviewRulerLane, Uri } from "vscode";
import { TextEditorDecorationType } from "vscode";

const svgBookmark = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<path d="M7 30 L7 5 Q7 2 10 2 L22 2 Q25 2 25 5 L25 30 L16 23 Z" fill="#888888ff" />
</svg>`;

const svgBookmarkWithText = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<mask id="x">
    <rect width="32" height="32" fill="white" x="0" y="0" />
    <text x="16" y="18" text-anchor="middle" fill="black"
        style="font-size: 16; font-family: sans-serif; alignment-baseline: bottom; font-weight:bold;">Q</text>
</mask>
<path mask="url(#x)" d="M7 30 L7 5 Q7 2 10 2 L22 2 Q25 2 25 5 L25 30 L16 23 Z" fill="#888888ff" />
</svg>`;

const svgCircle = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<circle cx="16" cy="16" r="12" fill="#888888ff" />
</svg>`;

const svgCircleWithText = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<mask id="x">
    <rect width="32" height="32" fill="white" x="0" y="0" />
    <text x="16" y="21.5" text-anchor="middle" fill="black"
        style="font-size: 16; font-family: sans-serif; alignment-baseline: bottom; font-weight:bold;">Q</text>
</mask>
<circle mask="url(#x)" cx="16" cy="16" r="12" fill="#888888ff" />
</svg>`;

const svgHeart = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<path fill="#888888ff"
    d="M16 8 C16 8 16 4 21 4 C24 4 28 5 28 10 C28 18 17 27 16 28 C15 27 4 18 4 10C4 5 8 4 11 4 C16 4  16 8 16 8" />
</svg>`;

const svgHeartWithText = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<mask id="x">
    <rect width="32" height="32" fill="white" x="0" y="0" />
    <text x="16" y="20" text-anchor="middle" fill="black"
        style="font-size: 14; font-family: sans-serif; alignment-baseline:bottom; font-weight:bold;">Q</text>
</mask>
<path mask="url(#x)" fill="#888888ff"
    d="M16 8 C16 8 16 4 21 4 C24 4 28 5 28 10 C28 18 17 27 16 28 C15 27 4 18 4 10C4 5 8 4 11 4 C16 4  16 8 16 8" />
</svg>`;

const svgLabel = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<path fill="#888888ff"
    d="M4 7 L24 7 L28 16 L24 25 L4 25 Z" />
</svg>`;

const svgLabelWithText = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<mask id="x">
    <rect width="32" height="32" fill="white" x="0" y="0" />
    <text x="15" y="21.5" text-anchor="middle" fill="black"
        style="font-size: 16; font-family: sans-serif; alignment-baseline: bottom; font-weight:bold;">Q</text>
</mask>
<path mask="url(#x)" fill="#888888ff" d="M4 7 L24 7 L28 16 L24 25 L4 25 Z" />
</svg>`;

const svgStar = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<path fill="#888888ff"
    d="M16 2 L20.70 9.52 L29.31 11.67 L23.60 18.47 L24.22 27.32 L16 24 L7.77 27.32 L8.39 18.47 L2.68 11.67 L11.29 9.52 Z" />
</svg>`;

const svgStarWithText = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<mask id="x">
    <rect width="32" height="32" fill="white" x="0" y="0" />
    <text x="16" y="21" text-anchor="middle" fill="black"
        style="font-size: 14; font-family: sans-serif; alignment-baseline:bottom; font-weight:bold;">Q</text>
</mask>
<path mask="url(#x)" fill="#888888ff"
    d="M16 2 L20.70 9.52 L29.31 11.67 L23.60 18.47 L24.22 27.32 L16 24 L7.77 27.32 L8.39 18.47 L2.68 11.67 L11.29 9.52 Z" />
</svg>`;

const svgUnicodeChar = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
<text x="16" y="18" text-anchor="middle" fill="#888888ff"
    style="font-size: 26; alignment-baseline:middle;">Q</text>
</svg>`;

export class DecorationFactory {
    private readonly singleCharacterLabelPatern = /^[a-zA-Z0-9!?+-=\/\$%#]$/;

    public readonly placeholderDecorationUri = Uri.file(
        path.join(__dirname, "..", "resources", "gutter_icon_bm.svg")
    );

    public readonly placeholderDecoration = vscode.window.createTextEditorDecorationType(
        {
            gutterIconPath: this.placeholderDecorationUri.fsPath,
            gutterIconSize: 'contain',
        }
    );

    public svgDir: Uri;
    public overviewRulerLane: OverviewRulerLane | undefined;
    public lineEndLabelType: string;

    constructor(svgDir: Uri, overviewRulerLane: OverviewRulerLane | undefined, lineEndLabelType: string) {
        this.svgDir = svgDir;
        this.overviewRulerLane = overviewRulerLane;
        this.lineEndLabelType = lineEndLabelType;
    }

    public generateSvg(shape: string, color: string, iconText: string): [string, string] {
        iconText = iconText.normalize();

        if (shape !== "unicode") {
            if (!this.singleCharacterLabelPatern.test(iconText)) {
                iconText = "";
            } else {
                iconText = iconText.substring(0, 1).toUpperCase();
            }
        }

        let fileNamePostfix = '';
        let svg: string;

        if (iconText === "") {
            switch (shape) {
                case "circle": svg = svgCircle; break;
                case "heart": svg = svgHeart; break;
                case "label": svg = svgLabel; break;
                case "star": svg = svgStar; break;
                default:
                    svg = svgBookmark;
                    shape = "bookmark";
            }
        } else {
            switch (shape) {
                case "circle": svg = svgCircleWithText; break;
                case "heart": svg = svgHeartWithText; break;
                case "label": svg = svgLabelWithText; break;
                case "star": svg = svgStarWithText; break;
                case "unicode": svg = svgUnicodeChar; break;
                default:
                    svg = svgBookmarkWithText;
                    shape = "bookmark";
            }
            let codePoint = (iconText.codePointAt(0) ?? 0).toString(10);
            svg = svg.replace(">Q<", ">&#" + codePoint + ";<");
            fileNamePostfix = codePoint;
        }

        color = this.normalizeColorFormat(color);
        svg = svg.replace("888888ff", color);
        return [svg, fileNamePostfix];
    }

    async create(shape: string, color: string, iconText: string, lineLabel?: string): Promise<[TextEditorDecorationType, Uri]> {
        let [svg, fileNamePostfix] = this.generateSvg(shape, color, iconText);

        let fileName = shape + "_" + color + "_" + fileNamePostfix + ".svg";
        let bytes = Uint8Array.from(svg.split("").map(c => { return c.charCodeAt(0); }));
        let svgUri = Uri.joinPath(this.svgDir, fileName);

        try {
            let stat = await vscode.workspace.fs.stat(svgUri);
            if (stat.size < 1) {
                await vscode.workspace.fs.writeFile(svgUri, bytes);
            }
        } catch (e) {
            await vscode.workspace.fs.writeFile(svgUri, bytes);
        }

        let decorationOptions = {
            gutterIconPath: svgUri,
            gutterIconSize: 'contain',
            overviewRulerColor: (typeof this.overviewRulerLane !== "undefined")
                ? '#' + color
                : undefined,
            overviewRulerLane: this.overviewRulerLane,
            rangeBehavior: DecorationRangeBehavior.ClosedClosed,
            after: {},
            isWholeLine: true,
        };

        if (typeof lineLabel !== "undefined") {
            switch (this.lineEndLabelType) {
                case "bordered":
                    decorationOptions.after = {
                        border: "1px solid #" + color,
                        color: "#" + color,
                        contentText: "\u2002" + lineLabel + "\u2002",
                        margin: "0px 0px 0px 10px",
                    };
                    break;
                case "inverse":
                    decorationOptions.after = {
                        backgroundColor: "#" + color,
                        color: new vscode.ThemeColor("editor.background"),
                        contentText: "\u2002" + lineLabel + "\u2002",
                        margin: "0px 0px 0px 10px",
                    };
                    break;
            }
        }

        let result = vscode.window.createTextEditorDecorationType(decorationOptions);

        return [result, svgUri];
    }

    public normalizeColorFormat(color: string): string {
        if (color.match(/^#?[0-9a-f]+$/i) === null) {
            return "888888ff";
        }

        if (color.charAt(0) === "#") {
            color = color.substr(1, 8);
        } else {
            color = color.substr(0, 8);
        }

        color = color.toLowerCase();

        if (color.length < 8) {
            color = color.padEnd(8, "f");
        }

        return color;
    }
}