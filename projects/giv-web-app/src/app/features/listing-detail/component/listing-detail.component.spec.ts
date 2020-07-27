import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ActivatedRouteStub } from '../../../../testing/activated-route-stub';
import { Listing } from '../../../shared/models/listing/listing.model';
import { ListingDetailComponent } from './listing-detail.component';
import { ListingDetailService } from '../service/listing-detail.service';
import { SharedModule } from '../../../shared/shared.module';
import { AsyncActionState } from '../../../shared/models/component_async_action/component_async_action';
import { AsyncAction } from 'rxjs/internal/scheduler/AsyncAction';
import { fake } from 'projects/giv-web-app/src/testing/fake-api-response';

describe('ListingDetailComponent', () => {
  let component: ListingDetailComponent;
  let fixture: ComponentFixture<ListingDetailComponent>;
  let template: HTMLElement;
  let mockService: jasmine.SpyObj<ListingDetailService>;
  let activatedRouteStub: ActivatedRouteStub;

  beforeEach(() => {
    mockService = jasmine.createSpyObj<ListingDetailService>(
      'ListingDetailService',
      ['getListing']
    );

    activatedRouteStub = new ActivatedRouteStub({ id: '20' });

    TestBed.configureTestingModule({
      providers: [
        { provide: ListingDetailService, useValue: mockService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
      declarations: [ListingDetailComponent],
      imports: [SharedModule],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingDetailComponent);
    component = fixture.componentInstance;
    template = fixture.nativeElement;
  });

  describe('ui', () => {
    describe('when get listing request is loading', () => {
      beforeEach(() => {
        mockService.getListing.and.returnValue(
          of(Listing.getOneFake({ id: 1 }))
        );

        fixture.detectChanges();

        component.getListingRquest.state = AsyncActionState.LOADING;

        fixture.detectChanges();
      });

      it('should render loading state', () => {
        expect(
          template.querySelector('[data-test="loading-state"]')
        ).toBeTruthy();
      });

      it('should NOT render success state', () => {
        expect(
          template.querySelector('[data-test="success-state"]')
        ).toBeFalsy();
      });
    });

    describe('when get listing request suceeds', () => {
      const fakeListing = Listing.getOneFake({ id: 1 });

      beforeEach(() => {
        mockService.getListing.and.returnValue(of(fakeListing));

        fixture.detectChanges();
      });

      it('should render an image carousel', () => {
        expect(template.querySelector('[data-test="carousel"]')).toBeTruthy();
      });

      it('should render a slide for each image', () => {
        expect(template.querySelectorAll('[data-test="slide"]').length).toBe(
          fakeListing.listingImages.length
        );
      });

      it('should render each image', () => {
        expect(
          template.querySelectorAll('[data-test="slide"] img').length
        ).toBe(fakeListing.listingImages.length);
      });

      it('should render the title', () => {
        const titleElement = template.querySelector('[data-test="title"]');
        expect(titleElement).toBeTruthy();
        expect(titleElement?.innerHTML).toContain(fakeListing.title);
      });

      it('should render the description', () => {
        const descriptionElement = template.querySelector(
          '[data-test="description"]'
        );
        expect(descriptionElement).toBeTruthy();
        expect(descriptionElement?.innerHTML).toContain(
          fakeListing.description
        );
      });

      describe('should render the user', () => {
        const user = fakeListing.user;

        it('should render the user name', () => {
          const userNameElement = template.querySelector(
            '[data-test="user-name"]'
          );
          expect(userNameElement).toBeTruthy();
          expect(userNameElement?.innerHTML).toContain(user.name);
        });

        it('should render the user avatar', () => {
          const userAvatarElement = template.querySelector(
            'img[data-test="user-avatar"]'
          ) as HTMLImageElement;
          expect(userAvatarElement).toBeTruthy();
          expect(userAvatarElement.src).toEqual(user.imageUrl);
        });
      });

      it('should render the report', () => {
        const reportElement = template.querySelector('[data-test="report"]');
        expect(reportElement).toBeTruthy();
      });
    });
  });

  describe('state managment', () => {
    it('get listing request state should start READY', () => {
      expect(component.getListingRquest.state).toBe(AsyncActionState.READY);
    });

    it('get listing request state should be SUCCESS after service response', () => {
      mockService.getListing.and.returnValue(of(Listing.getOneFake({ id: 1 })));

      fixture.detectChanges();

      expect(component.getListingRquest.state).toBe(AsyncActionState.SUCCESS);
    });
  });

  describe('data flow', () => {
    let listingId: number;

    beforeEach(() => {
      listingId = 1;
      activatedRouteStub.setParamMap({ id: `${listingId}` });
    });

    it('should fetch listing that corresponds to the "id" paramater', () => {
      // Given
      const fakeListing = Listing.getOneFake({ id: listingId });
      mockService.getListing.and.returnValue(of(fakeListing));

      // When
      fixture.detectChanges();

      activatedRouteStub.paramMap.subscribe((map) => {
        // Then
        expect(component.listingId).toBe(listingId);
        expect(mockService.getListing).toHaveBeenCalledWith(listingId);
      });
    });

    it('should get listing from service', () => {
      // Arrange / Given
      const fakeListing = Listing.getOneFake({ id: listingId });
      mockService.getListing.and.returnValue(of(fakeListing));

      // Act / When
      fixture.detectChanges();

      // Assert / Then
      activatedRouteStub.paramMap.subscribe((map) =>
        // Then
        expect(component.listing).toEqual(
          jasmine.objectContaining<Listing>({
            ...fakeListing,
          })
        )
      );
    });
  });
});
