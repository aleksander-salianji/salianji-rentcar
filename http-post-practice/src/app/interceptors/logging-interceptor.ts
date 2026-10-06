import {
  HttpInterceptorFn,
  HttpResponse
} from '@angular/common/http';

import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {

  return next(req).pipe(

    tap((event) => {

      if (event instanceof HttpResponse) {

        // HTTP Response u mor me sukses

      }

    })

  );

};