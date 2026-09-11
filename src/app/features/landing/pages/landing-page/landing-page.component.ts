import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../components/hero/hero.component';
import { TechMarqueeComponent } from '../../components/tech-marquee/tech-marquee.component';
import { IndustriesCollageComponent } from '../../components/industries-collage/industries-collage.component';
import { TeamProfilesComponent } from '../../components/team-profiles/team-profiles.component';
import { ProjectsShowcaseComponent } from '../../components/projects-showcase/projects-showcase.component';
import { QuoteEstimatorComponent } from '../../components/quote-estimator/quote-estimator.component';
import { OfficeComponent } from '../../components/office/office.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    TechMarqueeComponent,
    IndustriesCollageComponent,
    TeamProfilesComponent,
    ProjectsShowcaseComponent,
    QuoteEstimatorComponent,
    OfficeComponent
  ],
  templateUrl: './landing-page.component.html'
})
export class LandingPageComponent {}
