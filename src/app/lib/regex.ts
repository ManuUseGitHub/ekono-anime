export const tagOption = (option: string) => {
  let m: any = /^(?<option>[^:]*):?(?<value>.*)$/.exec(option);
  if (m) {
    const { option, value } = m.groups;
    return { option, value: value || option };
  }
  return { option, value: option };
};