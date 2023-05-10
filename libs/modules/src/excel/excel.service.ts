import { BadRequestException, Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import tmp from 'tmp';
import { NotFoundException } from '@app/common-module';

@Injectable()
export class ExcelService {
  async createExcel(data: any[], title: string): Promise<any> {
    if (!data) {
      throw new NotFoundException('No data to convert to export', 404);
    }

    const book = new Workbook();
    const sheet = book.addWorksheet(title);

    const rows = [];
    data.forEach((doc) => {
      rows.push(Object.values(doc));
    });
    //adding header row
    sheet.addRow(Object.keys(data[0]));
    sheet.addRows(rows);

    //address row width
    sheet.getColumn(2).width = 50;

    //email row width
    sheet.getColumn(3).width = 25;

    //twitter row width
    sheet.getColumn(4).width = 25;

    //discord row width
    sheet.getColumn(5).width = 25;

    //twitter row width
    sheet.getColumn(6).width = 25;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const file = await new Promise((resolve, reject) => {
      tmp.file(
        {
          discardDescriptor: true,
          prefix: 'Customers',
          postfix: '.xlsx',
          mode: parseInt('0600', 8)
        },
        async (err, file) => {
          if (err) {
            throw new BadRequestException(err);
          }

          book.xlsx
            .writeFile(file)
            .then(() => {
              resolve(file);
            })
            .catch((err) => {
              throw new BadRequestException(err);
            });
        }
      );
    });
    return file;
  }
}
