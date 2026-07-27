export type PlistScalar = string | number | boolean;

export type PlistValue = PlistScalar | PlistDictionary | PlistArray;

export type PlistArray = PlistValue[];

export interface PlistDictionary {
  [key: string]: PlistValue | undefined;
}
