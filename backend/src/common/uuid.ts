import { NotFoundException, PipeTransform } from '@nestjs/common';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);

// Кривой id в адресе — это просто "не найдено", а не ошибка сервера
export class UuidParamPipe implements PipeTransform<string, string> {
  transform(value: string) {
    if (!isUuid(value)) throw new NotFoundException();
    return value;
  }
}
