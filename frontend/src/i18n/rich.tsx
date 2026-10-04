import { Fragment } from "react";

// Перевод со вставками: rich("Created by {name}", { name: <Link .../> }).
// Порядок слов в языках разный, поэтому ссылки и выделения подставляются по имени, а не склеиваются
export const rich = (template: string, values: Record<string, React.ReactNode>) =>
  template.split(/\{(\w+)\}/).map((part, i) => <Fragment key={i}>{i % 2 ? values[part] : part}</Fragment>);
