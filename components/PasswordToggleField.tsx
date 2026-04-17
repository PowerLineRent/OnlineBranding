'use client';

import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
} from 'react';

type PasswordToggleFieldContextValue = {
  isVisible: boolean;
  setIsVisible: (value: boolean | ((prev: boolean) => boolean)) => void;
};

const PasswordToggleFieldContext = createContext<PasswordToggleFieldContextValue | null>(null);

function usePasswordToggleFieldContext() {
  const context = useContext(PasswordToggleFieldContext);
  if (!context) {
    throw new Error('PasswordToggleField components must be used within PasswordToggleField.Root.');
  }
  return context;
}

type PasswordToggleFieldRootProps = {
  children: ReactNode;
  className?: string;
};

function Root({ children, className }: PasswordToggleFieldRootProps) {
  const [isVisible, setIsVisible] = useState(false);
  const value = useMemo(() => ({ isVisible, setIsVisible }), [isVisible]);

  return (
    <PasswordToggleFieldContext.Provider value={value}>
      <div className={className}>{children}</div>
    </PasswordToggleFieldContext.Provider>
  );
}

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function PasswordToggleFieldInput(
  { ...props },
  ref,
) {
  const { isVisible } = usePasswordToggleFieldContext();
  return <input ref={ref} {...props} type={isVisible ? 'text' : 'password'} />;
});

const Toggle = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function PasswordToggleFieldToggle(
  { children, onClick, type, ...props },
  ref,
) {
  const { isVisible, setIsVisible } = usePasswordToggleFieldContext();

  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setIsVisible((current) => !current);
        }
      }}
      {...props}
      aria-pressed={isVisible}
    >
      {children}
    </button>
  );
});

type PasswordToggleFieldIconProps = {
  visible: ReactNode;
  hidden: ReactNode;
};

function Icon({ visible, hidden }: PasswordToggleFieldIconProps) {
  const { isVisible } = usePasswordToggleFieldContext();
  return <>{isVisible ? visible : hidden}</>;
}

export const PasswordToggleField = {
  Root,
  Input,
  Toggle,
  Icon,
};
