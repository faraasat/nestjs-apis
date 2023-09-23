import { Expose } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

export interface PaginateOptions {
  limit: number;
  currentPage: number;
  total?: boolean;
}

// in js when compiled interface turns into nothing so we are making it class
// export interface PaginationResult<T> {
//   first: number;
//   last: number;
//   limit: number;
//   total?: number;
//   data: T[];
// }
export class PaginationResult<T> {
  // Partial means it has optional parameters of the class passed
  constructor(partial: Partial<PaginationResult<T>>) {
    Object.assign(this, partial);
  }

  @Expose()
  first: number;
  @Expose()
  last: number;
  @Expose()
  limit: number;
  @Expose()
  total?: number;
  data: T[];
}

export async function paginate<T>(
  qb: SelectQueryBuilder<T>,
  options: PaginateOptions = {
    limit: 10,
    currentPage: 1,
  },
): Promise<PaginationResult<T>> {
  const offset = (options.currentPage - 1) * options.limit;
  const data = await qb.limit(options.limit).offset(offset).getMany();

  // serializer would not be able to do anything to this because this is an object and decorators works on classes
  // return {
  //   first: offset + 1,
  //   last: offset + data.length,
  //   limit: options.limit,
  //   total: options.total ? await qb.getCount() : null,
  //   data: data,
  // };
  return new PaginationResult({
    first: offset + 1,
    last: offset + data.length,
    limit: options.limit,
    total: options.total ? await qb.getCount() : null,
    data: data,
  });
}
