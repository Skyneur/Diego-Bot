export interface OptionType {
  type: "User" | "Channel" | "String" | "Number" | "Role";
  name: string;
  description: string;
  required: boolean;
  choices: { name: string; value: any }[];
}
