import * as vscode from 'vscode';

import { BookmarkDataStorage } from "../interface/bookmark_data_storage";
import { Memento } from "vscode";
import { SerializableGroup } from "./serializable_group";
import { SerializableBookmark } from './serializable_bookmark';

export class BookmarkStorageInWorkspaceState implements BookmarkDataStorage {

    public readonly savedDataFormatVersionKey = "vscLabeledBookmarks.formatVersion";
    public readonly savedBookmarksKey = "vscLabeledBookmarks.bookmarks";
    public readonly savedGroupsKey = "vscLabeledBookmarks.groups";
    public readonly savedBookmarkTimestampKey = "vscodeLabeledBookmarks.bookmarkTimestamp";

    private keyPostfix = "";

    private dataFormatVersion: number;
    private groups: Array<SerializableGroup>;
    private bookmarks: Array<SerializableBookmark>;
    private timestamp: number;

    private workspaceState: Memento;

    constructor(workspaceState: Memento, keyPostfix: string, abortOnError: boolean) {
        this.dataFormatVersion = 0;
        this.groups = new Array<SerializableGroup>();
        this.bookmarks = new Array<SerializableBookmark>();
        this.timestamp = 0;

        this.workspaceState = workspaceState;
        if (keyPostfix !== "") {
            this.keyPostfix = "_";
        }
        this.keyPostfix += keyPostfix;

        this.readStorage(abortOnError);
    }

    private readStorage(abortOnError: boolean) {
        this.dataFormatVersion = this.workspaceState.get(this.savedDataFormatVersionKey + this.keyPostfix) ?? 0;

        this.ensureDataFormatCompatibility();

        let bookmarkTimestamp: number | undefined = this.workspaceState.get(this.savedBookmarkTimestampKey + this.keyPostfix);
        if (typeof bookmarkTimestamp === "undefined") {
            if (abortOnError) {
                throw new Error("Restoring timestamp failed");
            }
            bookmarkTimestamp = 0;
        }
        this.timestamp = bookmarkTimestamp;

        let serializedGroups: Array<SerializableGroup> | undefined = this.workspaceState.get(this.savedGroupsKey + this.keyPostfix);
        if (typeof serializedGroups === "undefined") {
            if (abortOnError) {
                throw new Error("Restoring bookmark groups failed");
            }
            serializedGroups = new Array<SerializableGroup>();
        }
        this.groups = serializedGroups;

        let serializedBookmarks: Array<SerializableBookmark> | undefined = this.workspaceState.get(this.savedBookmarksKey + this.keyPostfix);
        if (typeof serializedBookmarks === "undefined") {
            if (abortOnError) {
                throw new Error("Restoring bookmarks failed");
            }
            serializedBookmarks = new Array<SerializableBookmark>();
        }
        this.bookmarks = serializedBookmarks;
    }

    private ensureDataFormatCompatibility() {
        if (this.dataFormatVersion === 0) {
            // from v0 to v1: initial set up
            // - add timestamp
            // - add format v1
            // - add groups if not present
            // - add bookmarks if not present

            this.workspaceState.update(this.savedBookmarkTimestampKey + this.keyPostfix, 0);

            this.dataFormatVersion = 1;
            this.workspaceState.update(this.savedDataFormatVersionKey + this.keyPostfix, this.dataFormatVersion);

            let serializedGroups: Array<SerializableGroup> | undefined = this.workspaceState.get(this.savedGroupsKey + this.keyPostfix);
            if (typeof serializedGroups === "undefined") {
                this.workspaceState.update(this.savedGroupsKey + this.keyPostfix, new Array());
            }

            let serializedBookmarks: Array<SerializableBookmark> | undefined = this.workspaceState.get(this.savedBookmarksKey + this.keyPostfix);
            if (typeof serializedBookmarks === "undefined") {
                this.workspaceState.update(this.savedBookmarksKey + this.keyPostfix, new Array());
            }
        }
    }

    public getBookmarks(): Array<SerializableBookmark> {
        return this.bookmarks;
    }

    public getGroups(): Array<SerializableGroup> {
        return this.groups;
    }

    public getTimestamp(): number {
        return this.timestamp;
    };

    public setBookmarks(serializableBookmarks: Array<SerializableBookmark>): void {
        this.bookmarks = serializableBookmarks;
    };

    public setGroups(serializableGroups: Array<SerializableGroup>): void {
        this.groups = serializableGroups;
    }

    public setTimestamp(timestamp: number): void {
        this.timestamp = timestamp;
    }

    public persist(): void {
        this.workspaceState.update(this.savedDataFormatVersionKey + this.keyPostfix, this.dataFormatVersion);
        this.workspaceState.update(this.savedBookmarkTimestampKey + this.keyPostfix, this.timestamp);
        this.workspaceState.update(this.savedGroupsKey + this.keyPostfix, this.groups);
        this.workspaceState.update(this.savedBookmarksKey + this.keyPostfix, this.bookmarks);
    }
}