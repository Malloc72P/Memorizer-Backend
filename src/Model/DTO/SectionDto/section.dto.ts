export class SectionDto {
  public _id;
  public owner;
  public title;

  constructor(id?, owner?, title?) {
    this._id = id;
    this.owner = owner;
    this.title = title;
  }
}
