import { SearchIcon } from "../Icons";
import scss from "./SearchInput.module.scss";

type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  // md — компактный (хедер), lg — большой на страницах, xl — hero на главной
  size?: "md" | "lg" | "xl";
};

const SearchInput = ({ size = "lg", ...props }: SearchInputProps) => (
  <div className={`${scss.wrapper} ${scss[size]}`}>
    <SearchIcon className={scss.icon} size={size === "xl" ? 18 : 16} />
    <input type="search" className={scss.input} {...props} />
  </div>
);

export default SearchInput;
