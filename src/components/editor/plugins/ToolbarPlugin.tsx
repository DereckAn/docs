/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
  AlignRight,
  BoldIcon,
  Heading1,
  Heading2,
  Heading3,
  ItalicIcon,
  RedoIcon,
  StrikethroughIcon,
  UnderlineIcon,
  UndoIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// Import SVG icons

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const activeBlock = useActiveBlock();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  function toggleBlock(type: "h1" | "h2" | "h3" | "quote") {
    const selection = $getSelection();

    if (activeBlock === type) {
      return $setBlocksType(selection, () => $createParagraphNode());
    }

    if (type === "h1") {
      return $setBlocksType(selection, () => $createHeadingNode("h1"));
    }

    if (type === "h2") {
      return $setBlocksType(selection, () => $createHeadingNode("h2"));
    }

    if (type === "h3") {
      return $setBlocksType(selection, () => $createHeadingNode("h3"));
    }

    if (type === "quote") {
      return $setBlocksType(selection, () => $createQuoteNode());
    }
  }

  return (
    <div className="toolbar" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <UndoIcon width={16} height={16} className="text-white"/>
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <RedoIcon width={16} height={16} className="text-white"/>
      </button>
      <Divider />
      <button
        onClick={() => editor.update(() => toggleBlock("h1"))}
        data-active={activeBlock === "h1" ? "" : undefined}
        className={
          "toolbar-item spaced " + (activeBlock === "h1" ? "active" : "")
        }
      >
        <Heading1 width={16} height={16} className="text-white"/>
      </button>
      <button
        onClick={() => editor.update(() => toggleBlock("h2"))}
        data-active={activeBlock === "h2" ? "" : undefined}
        className={
          "toolbar-item spaced " + (activeBlock === "h2" ? "active" : "")
        }
      >
        <Heading2 width={16} height={16} className="text-white"/>
      </button>
      <button
        onClick={() => editor.update(() => toggleBlock("h3"))}
        data-active={activeBlock === "h3" ? "" : undefined}
        className={
          "toolbar-item spaced " + (activeBlock === "h3" ? "active" : "")
        }
      >
        <Heading3 width={16} height={16} className="text-white" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
        <BoldIcon width={16} height={16} className="text-white"/>
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Format Italics"
      >
        <ItalicIcon width={16} height={16} className="text-white" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <UnderlineIcon width={16} height={16} className="text-white" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        aria-label="Format Strikethrough"
      >
        <StrikethroughIcon width={16} height={16} className="text-white" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <AlignLeft width={16} height={16} className="text-white"/>
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <AlignCenter width={16} height={16} className="text-white" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <AlignRight width={16} height={16} className="text-white" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="toolbar-item"
        aria-label="Justify Align"
      >
        <AlignJustify width={16} height={16} className="text-white" />
      </button>{" "}
    </div>
  );
}

function useActiveBlock() {
  const [editor] = useLexicalComposerContext();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.registerUpdateListener(onStoreChange);
    },
    [editor]
  );

  const getSnapshot = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return null;

      const anchor = selection.anchor.getNode();
      let element =
        anchor.getKey() === "root"
          ? anchor
          : $findMatchingParent(anchor, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchor.getTopLevelElementOrThrow();
      }

      if ($isHeadingNode(element)) {
        return element.getTag();
      }

      return element.getType();
    });
  }, [editor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
