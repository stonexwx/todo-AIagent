import React, {
  createContext,
  useContext,
  useState,
  useId,
  KeyboardEvent,
  Children,
  ReactElement,
  ReactNode,
} from "react";
import clsx from "clsx";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (id: string) => void;
};

const TabsContext = createContext<TabsContextType>({} as TabsContextType);

export interface TabsProps {
  children: ReactNode;
  defaultActiveTab?: string;
  variant?: "surface" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Tabs = ({ children, defaultActiveTab }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(
    defaultActiveTab ||
      Children.map(
        children,
        (child) => (child as ReactElement)?.key
      )?.[0]?.toString() ||
      ""
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        className="flex gap-2 p-1 bg-surface-100 rounded-lg"
        role="tablist"
        aria-label="导航标签"
        aria-orientation="horizontal"
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export interface TabProps {
  tabId: string;
  children: ReactNode;
  disabled?: boolean;
  "aria-label"?: string;
  /** @deprecated 使用 aria-label 替代 */
  ariaLabel?: string;
}

export const Tab = ({
  tabId: id,
  children,
  disabled = false,
  "aria-label": ariaLabel,
}: TabProps) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const generatedId = useId();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;

    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.findIndex((t) => t.id === `tab-${id}`);

    switch (e.key) {
      case "ArrowLeft": {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        (tabs[prevIndex] as HTMLElement).focus();
        setActiveTab(tabs[prevIndex].id.replace("tab-", ""));
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        (tabs[nextIndex] as HTMLElement).focus();
        setActiveTab(tabs[nextIndex].id.replace("tab-", ""));
        break;
      }
      case "Home": {
        e.preventDefault();
        (tabs[0] as HTMLElement).focus();
        setActiveTab(tabs[0].id.replace("tab-", ""));
        break;
      }
      case "End": {
        e.preventDefault();
        (tabs[tabs.length - 1] as HTMLElement).focus();
        setActiveTab(tabs[tabs.length - 1].id.replace("tab-", ""));
        break;
      }
    }
  };

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={activeTab === id ? "true" : "false"}
      aria-controls={`panel-${id}`}
      aria-label={ariaLabel || undefined}
      tabIndex={activeTab === id ? 0 : -1}
      onClick={() => !disabled && setActiveTab(id)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={clsx(
        "px-4 py-2 rounded-md transition-colors",
        activeTab === id ? "bg-primary text-white" : "hover:bg-surface-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
};

export interface TabPanelProps {
  id: string;
  children: ReactNode;
}

export const TabPanel = ({ id, children }: TabPanelProps) => {
  const { activeTab } = useContext(TabsContext);

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={activeTab !== id}
      className="tab-panel"
    >
      {activeTab === id && children}
    </div>
  );
};
